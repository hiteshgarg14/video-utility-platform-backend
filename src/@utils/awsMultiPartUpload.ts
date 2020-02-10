import Config from '../@configs';
import AWS, { AWSError } from 'aws-sdk';
import S3, { UploadPartRequest } from 'aws-sdk/clients/s3';

AWS.config.update({
  accessKeyId: Config.awsConfig.accessKeyId,
  secretAccessKey: Config.awsConfig.secretAccessKey,
  region: Config.awsConfig.region,
});

const s3 = new AWS.S3();

export default class AWSMultiPartUpload {
  private _chunkNum: number;
  private _chunksLeft: number;
  private _chunkSize: number;
  private _multipart!: S3.Types.CreateMultipartUploadOutput;
  private _multiPartParams: {
    Bucket: string;
    Key: string;
    ContentType: string;
  };
  private _multiPartMap: {
    Parts: {
      ETag: string;
      PartNumber: number;
    }[];
  };

  constructor(
    public fileName: string,
    public fileType: string,
    public fileSize: number,
  ) {
    this._chunkNum = 0;
    this._chunkSize = Config.awsConfig.chunkSize;
    this._chunksLeft = Math.ceil(this.fileSize / this._chunkSize);
    this._multiPartParams = {
      Bucket: Config.awsConfig.s3Bucket!,
      Key: this.fileName, // file path
      ContentType: this.fileType,
    };
    this._multiPartMap = {
      Parts: [],
    };

    this._createMultiPartUpload();
  }

  private _createMultiPartUpload() {
    console.log('Creating multipart upload for:', this.fileName);
    // tslint:disable-next-line: no-this-assignment
    const self = this;
    s3.createMultipartUpload(
      this._multiPartParams,
      (mpError: AWSError, multipart: S3.Types.CreateMultipartUploadOutput) => {
        if (mpError) {
          console.log(
            `Error while creating multipart upload for file ${this.fileName}`,
            mpError,
          );
          return;
        }

        self._multipart = multipart;
      },
    );
  }

  public startUpload(data: string) {
    // Grab each partSize chunk and upload it as a part
    console.log(`Uploading ${data.length} bytes of data to aws`);
    console.log(Buffer.from(data, 'binary'));
    this._chunkNum += 1;
    const partParams: UploadPartRequest = {
      Body: Buffer.from(data, 'binary'),
      Bucket: Config.awsConfig.s3Bucket!,
      Key: this.fileName,
      PartNumber: this._chunkNum,
      UploadId: this._multipart.UploadId!,
    };

    // Send a single part
    this._uploadPart(partParams);
  }

  private _uploadPart(partParams: UploadPartRequest, tryNum = 0) {
    s3.uploadPart(partParams, (multiErr, mData) => {
      if (multiErr) {
        console.log('multiErr, upload part error:', multiErr);
        if (tryNum < Config.awsConfig.maxUploadRetries) {
          console.log('Retrying upload of part: #', partParams.PartNumber);
          this._uploadPart(partParams, tryNum + 1);
        } else {
          console.log('Failed uploading part: #', partParams.PartNumber);
        }
        return;
      }

      this._multiPartMap.Parts[partParams.PartNumber - 1] = {
        ETag: mData.ETag!,
        PartNumber: +partParams.PartNumber,
      };

      console.log('Completed part', partParams.PartNumber);
      if (--this._chunksLeft > 0) return;

      const doneParams: S3.CompleteMultipartUploadRequest = {
        Bucket: Config.awsConfig.s3Bucket!,
        Key: this.fileName,
        MultipartUpload: this._multiPartMap,
        UploadId: this._multipart.UploadId!,
      };

      console.log('Completing upload...');
      this._completeMultipartUpload(doneParams);
    });
  }

  private _completeMultipartUpload(
    doneParams: S3.CompleteMultipartUploadRequest,
  ) {
    s3.completeMultipartUpload(
      doneParams,
      (error: AWSError, _: S3.Types.CompleteMultipartUploadOutput) => {
        if (error) {
          console.log(
            'An error occurred while completing the multipart upload',
          );
          console.log(error);
        } else {
          console.log('Done uploading data.');
        }
      },
    );
  }
}
