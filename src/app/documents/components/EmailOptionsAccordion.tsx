import { useMemo } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { Autocomplete, Box, Chip, Skeleton } from '@mui/material';

import { FormCheckbox, FormInput } from '@/components';

import { useContactsQuery } from '@/hooks/data';

import { handleEmailSelection } from '@/shared/utils';
import { ContactOption, DocumentLinkFormValues } from '@/shared/validation/documentLinkSchemas';

/**
 * “Sending” section — choose recipients for the link e-mail.
 * Reads and updates react-hook-form state directly via `useFormContext`.
 */
export default function EmailOptionsAccordion() {
	const {
		control,
		setValue,
		formState: { errors },
	} = useFormContext<DocumentLinkFormValues>();

	const isPublicLink = useWatch({ name: 'isPublic' });
	const selectFromContact = useWatch({ name: 'selectFromContact' });
	const sendToOthers = useWatch({ name: 'sendToOthers' });

	const { data: contacts = [], isLoading } = useContactsQuery();

	const contactOptions: ContactOption[] = useMemo(
		() =>
			contacts
				.filter((contact) => contact.email)
				.map((contact, index) => ({
					id: contact.id ?? index,
					email: contact.email,
					label: contact.name ? `${contact.name} <${contact.email}>` : contact.email,
					name: contact.name ?? '',
				})),
		[contacts],
	);

	const LoadingSkeleton = () => (
		<Box
			display='flex'
			flexDirection='column'
			gap={2}>
			{[...Array(4)].map((_, idx) => (
				<Skeleton
					key={idx}
					variant='text'
					height={24}
				/>
			))}
		</Box>
	);

	return (
		<Box py={4}>
			<FormCheckbox
				name='selectFromContact'
				label='Select from the contact list'
				disabledWhen={() => isPublicLink}
				clearOnFalse={['contactEmails']}
			/>

			<Box
				mt={3}
				mb={8}
				ml={13}>
				<Controller
					disabled={!selectFromContact || isPublicLink}
					control={control}
					name='contactEmails'
					render={({ field: { value, onChange } }) => (
						<Autocomplete
							multiple
							disablePortal={false}
							loading={isLoading}
							loadingText={<LoadingSkeleton />}
							options={contactOptions.filter(
								(option) => !value.some((selected) => selected.id === option.id),
							)}
							value={value}
							getOptionLabel={(option) => option.label ?? option.email}
							disabled={!selectFromContact || isPublicLink}
							onChange={(event, newValue) =>
								handleEmailSelection(newValue, onChange, (c) => (c as ContactOption).email)
							}
							renderOption={(props, option) => (
								<li {...props}>
									<Box
										component='span'
										sx={{ fontWeight: 500, mr: 10 }}>
										{option.name}
									</Box>
									<Box
										component='span'
										sx={{ color: 'text.notes' }}>
										&lt;{option.email}&gt;
									</Box>
								</li>
							)}
							renderTags={(tagValue, getTagProps) =>
								tagValue.map((option, index) => {
									const { key, ...restProps } = getTagProps({ index });
									return (
										<Chip
											key={key}
											label={option.label ?? option.email}
											{...restProps}
											size='small'
										/>
									);
								})
							}
							renderInput={(params) => (
								<FormInput
									{...params}
									id='searchContactEmails'
									placeholder='Search contacts'
									autoComplete='off'
									sx={{ overflowY: 'auto', maxHeight: 100 }}
									slotProps={{
										input: {
											autoComplete: 'new-password',
										},
									}}
								/>
							)}
						/>
					)}
				/>
			</Box>

			<FormCheckbox
				name='sendToOthers'
				label='Send to e-mails not in the contact list'
				disabledWhen={() => isPublicLink}
				clearOnFalse={['otherEmails']}
			/>

			<Box
				my={3}
				ml={13}
				maxHeight={200}>
				<Controller
					control={control}
					name='otherEmails'
					render={({ field: { value, onChange } }) => (
						<Autocomplete
							multiple
							freeSolo
							filterSelectedOptions
							options={[]} // freeSolo ⇒ no fixed list
							value={value}
							open={false}
							disabled={!sendToOthers || isPublicLink}
							onChange={(event, newValue) =>
								handleEmailSelection(newValue, onChange, (e) => e as string, true)
							}
							renderTags={(tagValue, getTagProps) =>
								tagValue.map((email, idx) => {
									const { key, ...restProps } = getTagProps({ index: idx });
									return (
										<Chip
											key={key}
											label={email}
											{...restProps}
											size='small'
										/>
									);
								})
							}
							renderInput={(params) => (
								<FormInput
									{...params}
									id='otherEmailsField'
									placeholder='Type e-mail and press Enter'
									autoComplete='off'
									sx={{ overflowY: 'auto', maxHeight: 100 }}
									slotProps={{
										input: {
											autoComplete: 'new-password',
										},
									}}
								/>
							)}
						/>
					)}
				/>
			</Box>
		</Box>
	);
}
