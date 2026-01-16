import React, { FC, SVGProps } from 'react';

interface DocIconProps extends SVGProps<SVGSVGElement> {
	width?: number;
	height?: number;
	color?: string;
	strokeWidth?: number;
}

/**
 * A reusable SVG icon component for rendering a document icon.
 *
 * @param {number} [width=24] - The width of the icon in pixels. Optional.
 * @param {number} [height=24] - The height of the icon in pixels. Optional.
 * @param {string} [color='#667085'] - The stroke color of the icon. Accepts any valid CSS color value. Optional.
 * @param {number} [strokeWidth=2] - The stroke width of the icon's path. Optional.
 * @param {SVGProps<SVGSVGElement>} props - Additional SVG props such as `className`, `style`, or custom attributes.
 *
 * @returns {JSX.Element} A scalable vector graphic (SVG) element representing the document icon.
 */
const FilePreviewIcon: FC<DocIconProps> = ({
	width = 24,
	height = 24,
	color = '#667085',
	strokeWidth = 2,
	...props
}) => {
	return (
		<svg
			width={width}
			height={height}
			viewBox='0 1 24 24'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
			aria-label='Doc Icon'
			role='img'
			{...props}>
			<path
				d='M14 2.26953V6.40007C14 6.96012 14 7.24015 14.109 7.45406C14.2049 7.64222 14.3578 7.7952 14.546 7.89108C14.7599 8.00007 15.0399 8.00007 15.6 8.00007H19.7305M16 18.5L14.5 17M14 2H8.8C7.11984 2 6.27976 2 5.63803 2.32698C5.07354 2.6146 4.6146 3.07354 4.32698 3.63803C4 4.27976 4 5.11984 4 6.8V17.2C4 18.8802 4 19.7202 4.32698 20.362C4.6146 20.9265 5.07354 21.3854 5.63803 21.673C6.27976 22 7.11984 22 8.8 22H15.2C16.8802 22 17.7202 22 18.362 21.673C18.9265 21.3854 19.3854 20.9265 19.673 20.362C20 19.7202 20 18.8802 20 17.2V8L14 2ZM15.5 14.5C15.5 16.433 13.933 18 12 18C10.067 18 8.5 16.433 8.5 14.5C8.5 12.567 10.067 11 12 11C13.933 11 15.5 12.567 15.5 14.5Z'
				stroke={color}
				strokeWidth={strokeWidth}
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
		</svg>
	);
};

export default FilePreviewIcon;
