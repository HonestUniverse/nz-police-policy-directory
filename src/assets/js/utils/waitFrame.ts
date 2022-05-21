/**
 * Call `requestAnimationFrame` twice to wait for a frame to pass.
 */
export async function waitFrame() {
	return new Promise((resolve) => {
		requestAnimationFrame(() => requestAnimationFrame(resolve));
	});
}
