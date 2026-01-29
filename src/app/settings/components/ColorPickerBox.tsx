import { useState } from 'react';
import { SketchPicker } from 'react-color';
import { Box, Dialog, IconButton } from '@mui/material';
import { useController, useFormContext } from 'react-hook-form';

import { FormInput } from '@/components';
import { UpdateBrandingSettingFormValues } from '@/hooks/forms';

export default function ColorPickerBox({ disabled = false }: { disabled?: boolean }) {
	const [showPicker, setShowPicker] = useState(false);

	const { control } = useFormContext<UpdateBrandingSettingFormValues>();

	const {
		field: { value, onChange },
	} = useController({
		name: 'primaryColor',
		control,
	});

	// true source of truth
	const primaryColor = value ?? '#ED7D22';

	const togglePicker = () => {
		if (!disabled) setShowPicker((p) => !p);
	};

	const handleColorChange = (newColor: any) => {
		onChange(newColor.hex); // updates RHF correctly
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
					'&:hover': { bgcolor: primaryColor },
				}}
				onClick={togglePicker}
			/>

			<FormInput
				minWidth={120}
				fullWidth={false}
				value={primaryColor}
				disabled={disabled}
				onChange={(e) => onChange(e.target.value)}
				sx={{
					'& .MuiInputBase-input': { py: 0 },
					'& .MuiOutlinedInput-root fieldset': {
						border: 'none',
					},
				}}
			/>

			<Dialog
				onClose={togglePicker}
				open={showPicker}
				sx={{
					'& .MuiPaper-root': { minWidth: 200 },
				}}>
				<SketchPicker
					color={primaryColor}
					onChange={handleColorChange}
				/>
			</Dialog>
		</Box>
	);
}
