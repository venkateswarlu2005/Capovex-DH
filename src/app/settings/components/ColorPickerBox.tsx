import { useState } from 'react';
import { SketchPicker } from 'react-color';

import { Box, Dialog, IconButton } from '@mui/material';

import { FormInput } from '@/components';
import { UpdateBrandingSettingFormValues } from '@/hooks/forms';
import { useFormContext } from 'react-hook-form';

export default function ColorPickerBox({ disabled = false }: { disabled?: boolean }) {
	const [showPicker, setShowPicker] = useState(false);

	const { setValue, watch, register } = useFormContext<UpdateBrandingSettingFormValues>();

	const primaryColor = watch('primaryColor') ?? '#1570EF'; // Default to Bluewave blue if not set

	const handleColorChange = (newColor: any) => {
		setValue('primaryColor', newColor.hex, { shouldDirty: true });
		setValue('themePreset', null, { shouldDirty: true }); // clears preset
	};

	//Open and close a color picker
	const togglePicker = () => {
		setShowPicker(!showPicker);
	};

	return (
		<Box
			border={1}
			borderColor='text.notes'
			borderRadius={2}
			width={150}
			p={3}
			display='flex'
			alignItems='center'
			sx={{
				pointerEvents: disabled ? 'none' : 'auto',
				opacity: disabled ? 0.4 : 1,
			}}>
			<IconButton
				sx={{
					bgcolor: primaryColor,
					border: 1,
					borderRadius: 2,
					p: 5,
					'&:hover': {
						bgcolor: primaryColor,
					},
				}}
				onClick={() => {
					if (!disabled) togglePicker();
				}}></IconButton>
			<FormInput
				minWidth={120}
				fullWidth={false}
				{...register('primaryColor')}
				value={primaryColor}
				disabled={disabled}
				sx={{
					'& .MuiInputBase-input': { py: 0 },
					'& .MuiOutlinedInput-root': {
						'& fieldset': {
							border: 'none',
						},
					},
				}}
			/>
			<Dialog
				onClose={togglePicker}
				open={showPicker}
				sx={{
					'& .MuiPaper-root': {
						minWidth: 200,
					},
				}}>
				<SketchPicker
					color={primaryColor}
					onChange={handleColorChange}
				/>
			</Dialog>
		</Box>
	);
}
