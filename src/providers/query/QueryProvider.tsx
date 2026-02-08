'use client';

import React from 'react';
import {
	QueryClient,
	QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

interface Props {
	children: React.ReactNode;
}

const QueryProvider = ({ children }: Props) => {
	const [queryClient] = React.useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 1000 * 60 * 2, // 2 minutes
						gcTime: 1000 * 60 * 10,   // ⬅️ v5 replacement for cacheTime
						refetchOnWindowFocus: false,
						refetchOnReconnect: false,
						retry: 1,
					},
				},
			})
	);

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
};

export default QueryProvider;
