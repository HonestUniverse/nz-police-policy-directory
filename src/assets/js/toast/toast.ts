interface ToastOptions {
	duration: number,
}

const defaults: ToastOptions = {
	duration: 6000,
};

const $toastContainer = document.createElement('div');
$toastContainer.classList.add('toast__container');
$toastContainer.setAttribute('aria-live', 'polite');

document.body.append($toastContainer);

export function toast(message: string, opts?: Partial<ToastOptions>): void {
	const options: ToastOptions = {
		...defaults,
		...opts,
	};

	const $toast = createToast();
	$toast.innerText = message;

	const keyFrom: Keyframe = {
		opacity: 0,
	};
	if (matchMedia('(prefers-reduced-motion: reduce)').matches === false) {
		keyFrom.transform = 'translateY(100%)';
	}

	$toastContainer.append($toast);
	$toast.animate([keyFrom, {}], {
		duration: 300,
		fill: 'backwards',
	});

	queueDestroyToast($toast, options.duration);
}

function createToast(): HTMLDivElement {
	const $toast = document.createElement('div');
	$toast.classList.add('toast');

	return $toast;
}

function queueDestroyToast($toast: HTMLElement, duration: number): Promise<void> {
	return new Promise((resolve, reject) => {
		window.setTimeout(() => {
			const keyTo: Keyframe = {
				opacity: 0,
			};
			if (matchMedia('(prefers-reduced-motion: reduce)').matches === false) {
				keyTo.transform = 'translateY(-100%)';
			}

			const animation = $toast.animate([{}, keyTo], {
				duration: 300,
				fill: 'forwards',
			});

			animation.addEventListener('finish', () => {
				$toast.remove();
				resolve();
			});
			// TODO: Handle what happens if animations are prevented
		}, duration);
	});
}
