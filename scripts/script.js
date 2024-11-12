const videoelement = document.getElementById("videoelement");
const localStreamConstraints = {
  audio: true,
  video: { width: 1024, height: 720 },
};

let mediarecorder;
let recordedChunks = [];

if (videoelement) {
  navigator.mediaDevices
    .getUserMedia(localStreamConstraints)
    .then(gotStream)
    .catch(function (e) {
      if (
        confirm(
          "An error with camera occured:(" + e.name + ") Do you want to reload?"
        )
      ) {
        location.reload();
      }
    });
}

async function gotStream(stream) {
  videoelement.srcObject = stream;
  mediarecorder = new MediaRecorder(stream, {
    mimeType: "video/mp4; codecs=vp9",
  });
  mediarecorder.ondataavailable = handleDataAvailable;
  mediarecorder.start();
}

function handleDataAvailable(event) {
  if (event.data.size > 0) {
    recordedChunks.push(event.data);
  }
}

//? Ставим таймер на 1 час
setInterval(download, 600000);

//? Основная функция по отравке в телеграм
async function download() {
  mediarecorder.stop();

  const date = new Date();
  const fileName = `${date.getHours()}:${date.getMinutes()}`;

  const blob = new Blob(recordedChunks, {
    type: "video/mp4",
  });

  const formData = new FormData();

  formData.append("document", blob, `${fileName}.mp4`);
  formData.append(
    "caption",
    `${new Intl.DateTimeFormat("ru", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)} - ${fileName}`
  );

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument?chat_id=${CHAT_ID}`;

  fetch(url, {
    method: "POST",
    body: formData,
  });

  recordedChunks = [];
  mediarecorder.start();
}
