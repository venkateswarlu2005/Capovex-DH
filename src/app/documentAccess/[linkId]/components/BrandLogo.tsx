import { BlueWaveLogo } from '@/components';
import { Box } from '@mui/material';
import Image from 'next/image';

interface BrandLogoProps {
	src?: string | null;
}

export default function BrandLogo({ src }: BrandLogoProps) {
	return (
		<>
			{!!src ? (
				<Image
					src={src}
					alt='Brand logo'
				/>
			) : (
				<Box width={{ sm: 210, md: 230, lg: 250 }}>
					<BlueWaveLogo
						width='100%'
						height='auto'
					/>
				</Box>
			)}
		</>
	);
}
