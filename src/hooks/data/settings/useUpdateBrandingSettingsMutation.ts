import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { queryKeys } from '@/shared/queryKeys';
import { BrandingSetting, BrandingSettingResponse } from '@/shared/models';

export default function useUpdateBrandingSettingsMutation() {
	const queryClient = useQueryClient();

	return useMutation<BrandingSetting, Error, FormData>({
		mutationFn: async (formData) => {
			const { data } = await axios.patch<BrandingSettingResponse>(
				'/api/settings/branding',
				formData,
			);
			return data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.settings.branding.base,
			});
		},
	});
}
