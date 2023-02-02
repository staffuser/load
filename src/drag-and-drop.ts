const dropFileZone = document.querySelector(
  ".upload-zone_dragover"
) as HTMLElement;
const statusText = document.querySelector("#uploadForm_Status") as HTMLElement;
const sizeText = document.getElementById("uploadForm_Size")!;
const progressBar = document.getElementById(
  "progressBar"
) as HTMLProgressElement;

const uploadInput = document.querySelector(
  ".form-upload__input"
) as HTMLInputElement;

const setStatus = (statusText: string, statusContainer: HTMLElement) => {
  statusContainer.textContent = statusText;
};

const uploadUrl = "/unicorns";

["dragover", "drop"].forEach(function (event) {
  document.addEventListener(event, function (evt) {
    evt.preventDefault();
    return false;
  });
});

dropFileZone.addEventListener("dragenter", function () {
  dropFileZone.classList.add("_active");
});

dropFileZone.addEventListener("dragleave", function () {
  dropFileZone.classList.remove("_active");
});

dropFileZone.addEventListener("drop", function (event: DragEvent) {
  dropFileZone.classList.remove("_active");
  // @ts-ignore
  const file = event.dataTransfer?.files[0];
  if (!file) {
    return;
  }

  if (file.type.startsWith("image/")) {
    uploadInput.files = event.dataTransfer.files;
    processingUploadFile(file, sizeText, statusText, progressBar);
  } else {
    setStatus("Можно загружать только изображения", statusText);
    return false;
  }
});

uploadInput.addEventListener("change", (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file && file.type.startsWith("image/")) {
    processingUploadFile(file, sizeText, statusText, progressBar);
  } else {
    setStatus("Можно загружать только изображения", statusText);
    return false;
  }
});

export function processingUploadFile(
  file: File,
  sizeText: Element,
  statusText: HTMLElement,
  progressBar: HTMLProgressElement
) {
  if (file) {
    const dropZoneData = new FormData();
    const xhr = new XMLHttpRequest();

    dropZoneData.append("file", file);

    xhr.upload.addEventListener("progress", function (event) {
      const percentLoaded = Math.round((event.loaded / event.total) * 100);

      progressBar.value = percentLoaded;
      sizeText.textContent = `${event.loaded} из ${event.total} МБ`;
      setStatus(`Загружено ${percentLoaded}% | `, statusText);
    });

    xhr.open("POST", uploadUrl, true);

    xhr.send(dropZoneData);

    xhr.onload = function () {
      if (xhr.status == 200) {
        setStatus("Все загружено", statusText);
      } else {
        setStatus("Oшибка загрузки", statusText);
      }
      (sizeText as HTMLDivElement).style.display = "none";
    };
  }
}

export function processingDownloadFileWithFetch(url: string) {
  fetch(url, {
    method: "POST",
  }).then(async (res) => {
    const reader = res?.body?.getReader();
    while (true && reader) {
      const { value, done } = await reader?.read();
      console.log("value", value);
      if (done) break;
      console.log("Received", value);
    }
  });
}

// notes

// var rs = new ReadableStream({
//   pull(controller) {
//     uploaded += buf.byteLength
//     console.log('uploaded', uploaded)
//     crypto.getRandomValues(buf)
//     controller.enqueue(buf)
//     if ((start + 1000) < Date.now()) controller.close()
//   }
// })

// fetch(url, {
//   method: 'POST',
//   body: rs,
//   duplex: 'half'
// }).then(r => r.json()).then(console.log)
