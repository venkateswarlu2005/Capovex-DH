'use client';

import { ChangeEvent, MouseEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Box, MenuItem, Select, Typography, Link } from '@mui/material';
import Grid from '@mui/material/Grid2';

import { useToast } from '@/hooks';
import { useModalContext } from '@/providers/modal/ModalProvider';

import ColorPickerBox from './ColorPickerBox';

import AvatarCard from '@/components/common/AvatarCard';
import { Controller, FormProvider } from 'react-hook-form';
import { useBrandingSettingsQuery, useUpdateBrandingSettingsMutation } from '@/hooks/data';
import { useFormSubmission, useSettingForm } from '@/hooks/forms';
import { FormInput, LoadingButton, LoadingSpinner } from '@/components';

import { parseFileSize } from '@/shared/utils';
import { BG_PRESETS, BgPreset, THEME_PRESETS, ThemePreset } from '@/shared/config/brandingConfig';
import PresetSwatch from './PresetSwatch';
import ThemePreviewCard from './ThemePreviewCard';

export default function BrandingSetting() {
	const { showToast } = useToast();
	const { openModal } = useModalContext();

	const { data, isLoading: fetchLoading, error } = useBrandingSettingsQuery();
	const updateBrandingSettings = useUpdateBrandingSettingsMutation();

	const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(data?.logoUrl ?? null);

	// Create a ref for the hidden file input
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const form = useSettingForm(data); // NEW helper
	const {
		control,
		register,
		reset,
		watch,
		formState: { errors, isValid, isDirty },
		getValues,
		setValue,
		buildPayload,
	} = form;

	const showPersonalInfo = watch('showPersonalInfo');
	const displayName = watch('displayName');
	const themePreset = watch('themePreset');
	const primaryColor = watch('primaryColor');
	const bgPreset = watch('bgPreset');

	const presetChosen = themePreset !== null && themePreset !== undefined; // any preset string
	const hasCustomColor = !!primaryColor?.trim(); // valid hex in the field

	useEffect(() => {
		if (data) reset(data);
	}, [data, reset]);

	useEffect(() => {
		if (!showPersonalInfo) setValue('displayName', '');
	}, [showPersonalInfo, setValue]);

	// Submit data
	const { loading, handleSubmit, toast } = useFormSubmission({
		mutation: updateBrandingSettings,
		getVariables: () => {
			const { logo } = getValues();
			const formData = new FormData();
			formData.append('payload', JSON.stringify(buildPayload()));
			if (logo) formData.append('logo', logo);
			return formData;
		},
		validate: () => isValid,
		successMessage: 'Branding settings updated successfully!',
		onError: (err: any) =>
			toast.showToast({
				message: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
				variant: 'error',
			}),
	});

	// Handle file selection
	const handleUploadError = useCallback(
		(msg?: string) => {
			const errorMsg = msg || 'Previewing logo failed!';
			showToast({ message: errorMsg, variant: 'error' });
		},
		[showToast],
	);

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		const MAX_FILE_SIZE = parseFileSize('2 MB');

		if (file) {
			if (file.size > MAX_FILE_SIZE) {
				handleUploadError('File size exceeds 2 MB limit.');
				return;
			}

			if (!file.type.startsWith('image/')) {
				handleUploadError('Only image files are allowed.');
				return;
			}

			setValue('logo', file);
			setLogoPreviewUrl(URL.createObjectURL(file));
		}
	};

	const handleUpdateClick = (e: MouseEvent) => {
		e.preventDefault();
		fileInputRef.current?.click();
	};

	// Open the DeleteConfirm and UploadFile modals
	const handleDelete = (e: MouseEvent) => {
		// We do preventDefault() to avoid the link jump
		e.preventDefault();

		openModal({
			type: 'deleteConfirm',
			contentProps: {
				title: 'Really delete this logo?',
				description:
					'When you delete this logo, all the links associated with the logo will also be removed. This action is non-reversible.',
				onConfirm: () => {
					console.log('Logo deleted successfully!');
					showToast({
						message: 'Logo deleted successfully!',
						variant: 'success',
					});
				},
			},
		});
	};

	// TODO: Future enhancement - Replace direct file upload with modal file picker
	// const handleUpload = (e: MouseEvent) => {
	// 	e.preventDefault();

	// 	openModal({
	// 		type: 'uploadFile',
	// 		contentProps: {
	// 			title: 'Upload logo',
	// 			maxFileSize: '3 MB',
	// 			fileFormats: 'JPG, PNG',
	// 			onUploadComplete: () => {
	// 				console.log('Logo updated successfully!');
	// 				showToast({
	// 					message: 'Logo updated successfully!',
	// 					variant: 'success',
	// 				});
	// 			},
	// 		},
	// 	});
	// };

	if (fetchLoading) {
		return <LoadingSpinner />;
	}

	if (error) {
		return (
			<Box
				display='flex'
				justifyContent='center'
				alignItems='center'
				minHeight='50vh'>
				<Typography color='error'>
					{error instanceof Error ? error.message : 'Failed to load profile'}
				</Typography>
			</Box>
		);
	}

	return (
		<FormProvider {...form}>
			<Box
				component='form'
				onSubmit={handleSubmit}
				noValidate
				autoComplete='off'>
				<Box mb={{ sm: 12, md: 14, lg: 16 }}>
					<Typography variant='subtitle2'>
						Customize how your brand appears to the public across Capovex documents your visitors
						see.
					</Typography>
				</Box>

				<Box>
					<Grid
						container
						rowSpacing={12}
						columnSpacing={{ sm: 1, md: 2, lg: 3 }}
						alignItems='center'>
						{/* Logo */}
						<Grid size={5}>
							<Typography variant='h4'>Logo</Typography>
						</Grid>
						<Grid
							size={7}
							display='flex'
							alignItems='center'
							gap={5}>
							<Box>
								<label htmlFor='logo-upload'>
									<AvatarCard
										alt='Logo'
										initials='CIL'
										src={logoPreviewUrl || undefined}
										size={86}
									/>
								</label>
								<input
									id='logo-upload'
									type='file'
									accept='image/*'
									style={{ display: 'none' }}
									onChange={handleFileChange}
									ref={fileInputRef}
								/>
							</Box>
							<Box
								display='flex'
								gap={5}>
								<Link
									href='#'
									underline='hover'
									color='text.secondary'
									onClick={handleDelete}>
									Delete
								</Link>
								<Link
									href='#'
									underline='hover'
									onClick={handleUpdateClick}>
									Update
								</Link>
							</Box>
						</Grid>
						{/* TODO: Custom Theme + BgPreset and Preset Theme exclusivity still needs work */}
						{/* Theme Preset */}
						<Grid size={5}>
							<Typography variant='h4'>Theme Preset</Typography>
						</Grid>
						<Grid size={7}>
							<Controller
								control={control}
								name='themePreset'
								render={({ field }) => (
									<Select
										{...field}
										aria-label='themePreset'
										size='small'
										sx={{ minWidth: 150, opacity: hasCustomColor ? 0.4 : 1 }}
										disabled={hasCustomColor}
										value={field.value ?? ''}
										onChange={(e) => {
											field.onChange(e);
											setValue(
												'themePreset',
												e.target.value === '' ? null : (e.target.value as ThemePreset),
											);
										}}>
										{THEME_PRESETS.map((themePreset) => (
											<MenuItem
												key={themePreset}
												value={themePreset}>
												{themePreset.charAt(0).toUpperCase() + themePreset.slice(1)}
											</MenuItem>
											// TODO: Future enhancement for showing preset swatches
											// <MenuItem
											// 	key={themePreset}
											// 	value={themePreset}>
											// 	{themePreset.charAt(0).toUpperCase() + themePreset.slice(1)}
											// 	<PresetSwatch name={themePreset} />
											// </MenuItem>
										))}
										<MenuItem value=''>No Preset (Custom)</MenuItem>
									</Select>
								)}
							/>
						</Grid>

						{/* Background Color */}
						<Grid size={5}>
							<Typography variant='h4'>Background Color</Typography>
						</Grid>
						<Grid size={7}>
							<Controller
								control={control}
								name='bgPreset'
								render={({ field }) => (
									<Select
										{...field}
										aria-label='bgPreset'
										size='small'
										sx={{ minWidth: 150, opacity: presetChosen ? 0.4 : 1 }}
										disabled={presetChosen}
										onChange={(e) => {
											field.onChange(e);
											setValue('bgPreset', e.target.value as BgPreset);
										}}>
										{BG_PRESETS.map((bgPreset) => (
											<MenuItem
												key={bgPreset}
												value={bgPreset}>
												{bgPreset.charAt(0).toUpperCase() + bgPreset.slice(1)}
											</MenuItem>
										))}
									</Select>
								)}
							/>
						</Grid>

						{/* Custom Theme Color */}
						<Grid size={5}>
							<Typography variant='h4'>Custom Theme Color</Typography>
						</Grid>
						<Grid size={7}>
							<ColorPickerBox disabled={presetChosen} />
						</Grid>

						{/* Show Personal Info */}
						<Grid
							size={5}
							display='flex'
							flexDirection='column'
							gap={3}>
							<Typography variant='h4'>Show Personal Info</Typography>
							<Typography variant='body2'>
								Controls whether your avatar and display name are shown to public visitors on your
								documents.
							</Typography>
						</Grid>
						<Grid size={7}>
							<Controller
								control={control}
								name='showPersonalInfo'
								render={({ field }) => (
									<Select
										aria-label='showPersonalInfo'
										size='small'
										sx={{ minWidth: 150 }}
										{...field}
										onChange={(e) => {
											field.onChange(e);
											setValue('showPersonalInfo', e.target.value === 'true' ? true : false);
										}}>
										<MenuItem value='false'>No</MenuItem>
										<MenuItem value='true'>Yes</MenuItem>
									</Select>
								)}
							/>
						</Grid>

						{/* Display Name */}
						{showPersonalInfo && (
							<>
								<Grid size={5}>
									<Typography variant='h4'>Display Name</Typography>
								</Grid>
								<Grid
									size={5}
									display='flex'
									gap={7}>
									<FormInput
										minWidth={350}
										fullWidth={false}
										{...register('displayName')}
										errorMessage={errors.displayName?.message}
										inputProps={{ maxLength: 40 }}
										placeholder='Enter name'
									/>
									<Box mt={4.5}>
										<Typography variant={displayName ? 'h6' : 'body2'}>
											{displayName?.length || 0} / 40
										</Typography>
									</Box>
								</Grid>
							</>
						)}

						{/* TODO: Future enhancement for showing theme previews */}
						{/* <Grid
							size={12}
							sx={{ display: 'flex', justifyContent: 'flex-start', mt: 6 }}>
							<ThemePreviewCard
								themePreset={themePreset}
								primaryColor={primaryColor}
								bgPreset={bgPreset ?? 'plain'}
							/>
						</Grid> */}

						<Box
							width='100%'
							display='flex'
							justifyContent='flex-end'
							mt={{ sm: 30, md: 35, lg: 40 }}>
							<LoadingButton
								type='submit'
								loading={loading}
								buttonText='Save'
								loadingText='Saving...'
								fullWidth={false}
								disabled={!isDirty || !isValid || loading}
							/>
						</Box>
					</Grid>
				</Box>
			</Box>
		</FormProvider>
	);
}
