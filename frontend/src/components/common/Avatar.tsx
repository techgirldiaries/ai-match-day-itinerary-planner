import type { JSX } from "preact";

interface AvatarRootProps {
	children: JSX.Element | JSX.Element[];
}

export function AvatarRoot({ children }: AvatarRootProps) {
	return <div class="inline-block">{children}</div>;
}

interface AvatarImageProps {
	src?: string;
	alt?: string;
	class?: string;
}

export function AvatarImage({ src, alt, class: className }: AvatarImageProps) {
	return (
		<img
			src={src}
			alt={alt ?? ""}
			class={className}
			onError={(e) => {
				// Trigger fallback visibility on image load error
				(e.currentTarget as HTMLImageElement).style.display = "none";
			}}
		/>
	);
}

type AvatarFallbackProps =
	| { asChild: true; children: JSX.Element }
	| { asChild?: false; children: JSX.Element | string; class?: string };

export function AvatarFallback(props: AvatarFallbackProps) {
	if (props.asChild) {
		return props.children;
	}
	return <div class={props.class}>{props.children}</div>;
}

export const Avatar = {
	Root: AvatarRoot,
	Image: AvatarImage,
	Fallback: AvatarFallback,
} as const;
