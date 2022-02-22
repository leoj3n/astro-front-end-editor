let editorMarkers = [];

export default function attachEditor(opts) {
	//if (typeof document === 'undefined') return;
	if (import.meta.env.SSR) return;

	console.log('EDITOR ATTACH', opts);

	let attachToEl = document.getElementById(opts.scriptId);
	attachToEl = attachToEl.nextElementSibling || attachToEl.parentElement;
	if (opts.elementId !== 'undefined') { attachToEl = document.getElementById(opts.elementId); }
	console.log('attTo', attachToEl);

	const el = document.createElement('div');
	el.textContent = 'Edit';
	el.rect = attachToEl.getBoundingClientRect();
	el.style.left = el.rect.left + 'px';
	el.style.top = el.rect.top  + 'px';
	el.className = 'editorReset editorHintMarker';
	editorMarkers.push(el);

	if (window.editorOnce !== true) {
		styleStuff();
		windowStuff();
		window.editorOnce = true;
	}
}

function styleStuff() {
	const styleToAdd = `
	<style type="text/css">
	.editorReset {
		background: none;
		border: none;
		bottom: auto;
		box-shadow: none;
		color: black;
		cursor: auto;
		display: inline;
		float: none;
		font-family: "Helvetica Neue", "Helvetica", "Arial", sans-serif;
		font-size: inherit;
		font-style: normal;
		font-variant: normal;
		font-weight: normal;
		height: auto;
		left: auto;
		letter-spacing: 0;
		line-height: 100%;
		margin: 0;
		max-height: none;
		max-width: none;
		min-height: 0;
		min-width: 0;
		opacity: 1;
		padding: 0;
		position: static;
		right: auto;
		text-align: left;
		text-decoration: none;
		text-indent: 0;
		text-shadow: none;
		text-transform: none;
		top: auto;
		vertical-align: baseline;
		white-space: normal;
		width: auto;
		z-index: 2140000000;
	}
	.editorHintMarker {
		cursor: pointer;
		position: absolute;
		display: block;
		top: -1px;
		left: -1px;
		white-space: nowrap;
		overflow: hidden;
		font-size: 11px;
		padding: 1px 3px 0px 3px;
		background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#FFF785), color-stop(100%,#FFC542));
		border: solid 1px #C38A22;
		border-radius: 3px;
		box-shadow: 0px 3px 7px 0px rgba(0, 0, 0, 0.3);
	}
	</style>`;
	document.head.insertAdjacentHTML('beforeend', styleToAdd);
}

function windowStuff() {
	window.addEventListener('load', function(){
		addElementList(
			editorMarkers,
			{id: 'editorHintMarkerContainer', className: 'editorReset'});
	});
}

function addElementList(els, overlayOptions) {
	const parent = document.createElement('div');
	if (overlayOptions.id != null) { parent.id = overlayOptions.id; }
	if (overlayOptions.className != null) { parent.className = overlayOptions.className; }
	for (let el of els) { parent.appendChild(el); }

	document.documentElement.appendChild(parent);
	return parent;
}

