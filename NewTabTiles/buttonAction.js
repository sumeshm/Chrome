function buttonClick(event) {
	var targ = event.target || event.srcElement;
	document.getElementById("console").value += Date() + ":::";
	document.getElementById("console").value += targ.textContent
			|| targ.innerText;
	document.getElementById("console").value += "\n";
}

// Add event listeners once the DOM has fully loaded by listening for the
// `DOMContentLoaded` event on the document, and adding your listeners to
// specific elements when it triggers.
document.addEventListener('DOMContentLoaded', function() {
	document.querySelector('button').addEventListener('click', buttonClick);
});