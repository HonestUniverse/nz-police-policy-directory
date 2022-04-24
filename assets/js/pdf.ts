import type { PDFViewerOptions } from 'pdfjs-dist/types/web/base_viewer';
import 'pdfjs-dist/webpack';
import 'pdfjs-dist/web/pdf_viewer.css';
import { getDocument } from 'pdfjs-dist';
import { PDFViewer, EventBus } from 'pdfjs-dist/web/pdf_viewer';

(() => {
	const htmlViewer: HTMLObjectElement | null = document.querySelector('#viewer');
	if (!htmlViewer) return;

	const el = document.createElement('div');
	htmlViewer.replaceWith(el);
	el.style.width = "600px";
	el.style.height = "600px";
	el.style.position = "relative";

	const containerEl = document.createElement('div');
	containerEl.style.position = 'absolute';
	containerEl.style.width = "100%";
	containerEl.style.height = "100%";
	containerEl.style.overflow = "scroll";
	el.appendChild(containerEl);

	const viewerEl = document.createElement('div');
	containerEl.appendChild(viewerEl);

	const eventBus = new EventBus();

	const options = {
		container: containerEl,
		viewer: viewerEl,
		eventBus: eventBus,
		textLayerMode: 2,
	} as PDFViewerOptions;

	const viewer = new PDFViewer(options);

	getDocument(htmlViewer.data).promise.then((doc) => {
		viewer.setDocument(doc);
	});
})();
