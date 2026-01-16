import BrandLogo from './BrandLogo';
import { BrandingSetting } from '@/shared/models';
import { Avatar, Box, Chip, Stack, Typography } from '@mui/material';

interface BrandHeaderProps {
	branding: BrandingSetting | null;
}

export default function BrandHeader({ branding }: BrandHeaderProps) {
	return (
		<Box
			display='flex'
			alignItems='center'
			flexWrap='wrap'
			flexDirection={{ xs: 'column', sm: 'row', md: 'row', lg: 'row' }}
			gap={{ xs: 5, sm: !!branding?.logoUrl ? 8 : 40, md: 70, lg: 100 }}
			mb={10}>
			{/* Left: customer logo */}
			<Box>
				<BrandLogo src={branding?.logoUrl} />
			</Box>

			{/* Right: badge + personal info */}
			{(!!branding?.logoUrl || branding?.showPersonalInfo) && (
				<Stack
					direction='row'
					alignItems='center'
					spacing={{ sm: 8, md: 10, lg: 12 }}>
					{!!branding?.logoUrl && (
						<Chip
							label='Powered by DataHall'
							variant='outlined'
							sx={{
								minHeight: { sm: '5vh', md: '5.2vh', lg: '5.5vh' },
								'& .MuiChip-label': {
									px: { sm: 5, md: 8, lg: 10 },
									fontSize: { sm: 14, md: 16, lg: 20 },
									fontWeight: 600,
								},
							}}
						/>
					)}
					{branding?.showPersonalInfo && !!branding.displayName && (
						<Box
							display='flex'
							alignItems='center'>
							<Avatar
								alt={branding?.displayName}
								sx={{
									width: { sm: 40, md: 45, lg: 55 },
									height: { sm: 40, md: 45, lg: 55 },
									mr: { sm: 2, md: 2, lg: 4 },
								}}>
								{branding?.displayName.charAt(0).toUpperCase()}
							</Avatar>
							<Typography variant='h1'> {branding?.displayName} </Typography>
						</Box>
					)}
				</Stack>
			)}
		</Box>
	);
}
