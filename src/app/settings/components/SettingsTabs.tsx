'use client';

import { Tab, Tabs } from '@mui/material';

import { useHashTab } from '@/hooks';

export default function SettingsTabs() {
	const { tabKey, setTabKey } = useHashTab('branding', ['branding', 'system'] as const);

	const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
		if (newValue === 'branding' || newValue === 'system') setTabKey(newValue);
	};

	return (
		<>
			<Tabs
				value={tabKey}
				onChange={handleTabChange}
				textColor='primary'
				indicatorColor='primary'>
				<Tab
					value='branding'
					label='Branding & Layout'
					id='branding-tab'
				/>
				{/* <Tab
					value='system'
					label='System & Notifications'
					id='system-tab'
				/> */}
			</Tabs>
		</>
	);
}
