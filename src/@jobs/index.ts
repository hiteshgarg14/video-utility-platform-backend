import Bull from 'bull';
import configs from '../@configs';
import { setQueues } from 'bull-board';

export default class QueueFactory extends Bull {
  constructor(private customJob: (data: any) => Promise<any>) {
    super(customJob.name, configs.defaultRedisConfig);
    this.registerJob();
    setQueues(this);
  }

  private registerJob() {
    this.process(async job => {
      await this.customJob(job.data);
    });
  }
}

// TODO: automate this registration process
import videoConverterJob from './videoConverterJob';
export const videoConverterQueue = new QueueFactory(videoConverterJob);
