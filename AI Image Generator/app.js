const form = document.querySelector(".form");
const results = document.querySelector(".results");

//Vlastiti OpenAI API ključ (Ne dijelite s drugima)
const apiKey = "YOUR API KEY";
let generating = false;

//Ažuriranje prikaza slika
const frameUpdate = (imgDataArray) => {
  imgDataArray.forEach((imgObject, index) => {
    const oneFrame = results.querySelectorAll(".img-card")[index];
    const imgLoading = oneFrame.querySelector("img");
    const downloadButton = oneFrame.querySelector(".download-button")

    // Generisanje URL-a i postavljanje izvora slika
    const imgSource = `data:image/jpeg;base64,${imgObject.b64_json}`;
    imgLoading.src = imgSource;

    // Uklanjanje loading klase kada se slika učita
    imgLoading.onload = () => {
    oneFrame.classList.remove("loading");

    //Download slika
    downloadButton.setAttribute("href", imgSource);
    downloadButton.setAttribute("download", `${new Date().getTime()}.jpg`);
    }
  });
}


const generateImg = async (input, dropDown) => {
  try {
    // Zahtjev OpenAI-u da generiše slike bazirane na korisničkom upitu
    const response = await fetch ("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        // Tijelo zahtjeva koji se šalje OpenAI serveru sa funkcijom koja pretvara podatke u JSON format prije slanja
        body: JSON.stringify({
        prompt: input,
        n: parseInt(dropDown),
        size: "1024x1024",
        response_format: "b64_json"
            })
    });
        
    if(!response.ok) throw new Error("Failed to generate images! Please try again.")
        
    const { data } = await response.json(); 
    frameUpdate([...data])
  } catch (error) {
        alert(error.message);
    } finally {
        generating = false;
    }
}

// Sprječavanje višestrukog slanja upita dok je prethodni zahtjev u toku
const handleFormSubmission = (e) => {
  e.preventDefault();
  if(generating) return;
  generating = true;

  // Korisnički unos upita i broj primjera (1-4)
  const input = e.srcElement[0].value;
  const dropDown = e.srcElement[1].value;

    

  // HTML string okvira za prikazivanje generisanih slika (loading animacija)
  const loading = Array.from({ length: dropDown}, () =>
    `<div class="img-card loading">
      <img src="images/loading.svg" alt="AI generated image">
      <a class="download-button" href="#" >
        <img src="images/download.svg" alt="download icon">
      </a>
    </div>`
  ).join("")

  // Ažuriranje HTML-a i pokretanje procesa generisanja slike/a
  results.innerHTML = loading;
  generateImg(input, dropDown);
}
// Pozivanje prethodne funkcije
form.addEventListener("submit", handleFormSubmission);