import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

import { BrandingSetting, BrandingSettingResponse } from '@/shared/models';
import { queryKeys } from '@/shared/queryKeys';

export default function useBrandingSettingsQuery() {
	return useQuery<BrandingSettingResponse, Error, BrandingSetting>({
		queryKey: queryKeys.settings.branding.base,
		queryFn: async () => (await axios.get<BrandingSettingResponse>('/api/settings/branding')).data,
		select: (resp) => resp.data,
		staleTime: 5 * 60 * 1_000,
	});
}
