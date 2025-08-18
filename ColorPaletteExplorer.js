const rgb2Hex = (rgb) => {
	const [r, g, b] = rgb.match(/\d+/g).map(Number);
	const hex = `0x${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
	const hexString = `${hex.replace("0x", "#")}`.toUpperCase();
	return hexString;
};

const $ = (el, scope = document) => scope.getElementById(el);
const $$ = (els, scope = document) => scope.getElementsByClassName(els);

const colorData = [];
const inputContainer = $$("inputs-container")[0];
const colorBlocks = [...$$("base-color")];

const baseHue = $("baseHue"),
	saturation = $("saturation"),
	lightness = $("lightness"),
	rotation = $("rotation");

const data = new Proxy(
	{},
	{
		set(target, property, value, receiver) {
			const dataAttributes = document.querySelectorAll(
				`[data-prop="${property}"]`
			);

			for (const attr of dataAttributes) {
				attr.value = value;
			}
			updateColors();
			return true; 
		}
	}
);

inputContainer.addEventListener("input", (event) => {
	data[event.target.dataset.prop] = event.target.value;
});

const updateColors = () => {
	const setCSSVariable = (prop, value) =>
		document.documentElement.style.setProperty(prop, value);

	setCSSVariable("--base-hue", baseHue.value);
	setCSSVariable("--saturation", saturation.value + "%");
	setCSSVariable("--lightness", lightness.value + "%");
	setCSSVariable("--rotation", rotation.value);

	colorBlocks.forEach((block, index) => {
		const computedStyle = window.getComputedStyle(block);
		const computedColor = computedStyle.getPropertyValue("background-color");
		const colorCode = rgb2Hex(computedColor);

		block.innerHTML = colorCode;
		const cond = lightness.value < 65;
		block.style.color = cond ? "#fff" : "#464646";
		block.style.textShadow = cond ? "var(--shadow)" : "none";
		colorData[index] = {
			rgb: computedColor,
			hex: colorCode
		};
	});
};

$("colors").addEventListener("click", (e) => {
	let code = e.target.innerText;
	
	// Проверяем поддержку clipboard API
	if (navigator.clipboard && navigator.clipboard.writeText) {
		navigator.clipboard.writeText(e.target.innerText).catch(err => {
			console.log('Clipboard API не поддерживается:', err);
		});
	} else {
		// Fallback для старых браузеров
		const textArea = document.createElement("textarea");
		textArea.value = e.target.innerText;
		document.body.appendChild(textArea);
		textArea.select();
		try {
			document.execCommand('copy');
		} catch (err) {
			console.log('Fallback копирование не сработало:', err);
		}
		document.body.removeChild(textArea);
	}
	
	if ((e.target.innerText = code)) e.target.innerText = `copied\nto clipboard`;

	setTimeout(function () {
		e.target.innerText = code;
	}, 250);
});

const downloadPalette = () => {
	let fileContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Color Palette Explorer</title>
        <style>
		body {
			font-family: Montserrat;
		}
		* {
			margin: 0;
			padding: 0;
			border: none;
			outline: 0;
			box-sizing: border-box;
			text-align: center;
			}
			h1 {
			margin: 10vh;
			}
		#container {
			margin:auto;
			display: flex;
			flex-direction: row;
			width: fit-content;
			
			}
          .color-block {
            width: 100px;
            height: 160px;
            display: flex;
			justify-content: center;
            margin-right: 10px;
          }
		  .code {
		  	background: #fff;
			border-radius: 3px;
			border: 1px solid #0000002d;
		  	height: fit-content;
			width: 90%;
			margin: 5px auto;
			margin-top: 130%;
		  	}
        </style>
      </head>
      <body>
	  
        <h1>Palette Sample</h1>
		<div id="container">
  `;

	colorData.forEach(({ rgb, hex }) => {
		fileContent += `
        <div class="color-block" style="background-color:${rgb}">
		    <div class="code">${hex}</div>
	    </div>
     
    `;
	});

	fileContent += `
	</div>
      </body>
    </html>
  `;

	const blob = new Blob([fileContent], { type: "text/html" });

	const link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = "Color_Palette_Explorer.html";
	link.click();
};

$("saveButton").addEventListener("click", downloadPalette);

updateColors();