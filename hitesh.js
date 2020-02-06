var socket = io.connect('0.0.0.0:4000');

window.addEventListener('load', Ready);

function Ready() {
  if (window.File && window.FileReader) {
    //These are the relevant HTML5 objects that we are going to use
    document
      .getElementById('UploadButton')
      .addEventListener('click', StartUpload);
    document.getElementById('FileBox').addEventListener('change', FileChosen);
  } else {
    document.getElementById('UploadArea').innerHTML =
      "Your Browser Doesn't Support The File API Please Update Your Browser";
  }
}

var SelectedFile;
function FileChosen(evnt) {
  SelectedFile = evnt.target.files[0];
  document.getElementById('NameBox').value = SelectedFile.name;
  console.log(`File selected as ${SelectedFile.name}`);
}

var FReader;
var Name;
function StartUpload() {
  if (document.getElementById('FileBox').value != '') {
    FReader = new FileReader();
    Name = document.getElementById('NameBox').value;
    var Content =
      "<span id='NameArea'>Uploading " +
      SelectedFile.name +
      ' as ' +
      Name +
      '</span>';
    Content +=
      '<div id="ProgressContainer"><div id="ProgressBar"></div></div><span id="percent">0%</span>';
    Content +=
      "<span id='Uploaded'> - <span id='MB'>0</span>/" +
      Math.round(SelectedFile.size / 1048576) /* 1 MB = 1048576 bytes */ +
      'MB</span>';

    document.getElementById('UploadArea').innerHTML = Content;

    FReader.onload = function(evnt) {
      socket.emit('Upload', { Name: Name, Data: evnt.target.result });
    };

    // FIRST this event will trigger.
    socket.emit('Start', { Name: Name, Size: SelectedFile.size });
  } else {
    alert('Please Select A File');
  }
}

socket.on('MoreData', data => {
  UpdateBar(data['Percent']);
  var Place = data['Place'] * 524288; //The Next Blocks Starting Position
  var NewFile; //The Variable that will hold the new Block of Data

  //  we need to use webkitSlice and mozSlice for Webkit and Mozilla browsers, respectively.
  if (SelectedFile.slice) {
    NewFile = SelectedFile.slice(
      Place,
      Place + Math.min(524288, SelectedFile.size - Place),
    );
  } else {
    NewFile = SelectedFile.mozSlice(
      Place,
      Place + Math.min(524288, SelectedFile.size - Place),
    );
  }
  FReader.readAsBinaryString(NewFile); // This will trigger FReader.onload function.
});

function UpdateBar(percent) {
  document.getElementById('ProgressBar').style.width = percent + '%';
  document.getElementById('percent').innerHTML =
    Math.round(percent * 100) / 100 + '%';
  var MBDone = Math.round(((percent / 100.0) * SelectedFile.size) / 1048576);
  document.getElementById('MB').innerHTML = MBDone;
}

var Path = 'http://localhost/';

socket.on('Done', function(data) {
  var Content = 'Video Successfully Uploaded !!';
  console.log(Content);
  console.log(data['videoId']);
  Content +=
    "<img id='Thumb' src='" +
    Path +
    data['videoId'] +
    "' alt='" +
    Name +
    "'><br>";
  Content +=
    "<button  type='button' name='Upload' value='' id='Restart' class='Button'>Upload Another</button>";
  document.getElementById('UploadArea').innerHTML = Content;
  document.getElementById('Restart').addEventListener('click', refresh);
});

const refresh = () => {
  location.reload(true);
};
