import prisma from '@/lib/prisma';

import {
	Box,
	Container,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Typography,
} from '@mui/material';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';


import { UserRole } from '@/shared/enums';
import { BackgroundIcon, CheckCircleIcon } from '@/icons';

import DocumentsTable from './components/DocumentsTable';
import DragAndDropBox from './components/DragAndDropBox';

export const dynamic = 'force-dynamic';

export default async function DocumentsPage() {
	/* -------------------------------------------------------------------------- */
	/*  AUTH (SERVER SESSION — SAME AS SIDEBAR)                                   */
	/* -------------------------------------------------------------------------- */

	const session = await getServerSession(authOptions);

	if (!session?.user?.userId) {
		throw new Error('Unauthorized');
	}

	const userId = session.user.userId;
	const role = session.user.role;

	/* -------------------------------------------------------------------------- */
	/*  ROLE LOGIC                                                                */
	/* -------------------------------------------------------------------------- */

	// Investor == Admin (same mapping as Sidebar)
	const isInvestor = role === UserRole.Admin;

	/* -------------------------------------------------------------------------- */
	/*  INVESTOR VIEW → ONLY DOCUMENT TABLE                                       */
	/* -------------------------------------------------------------------------- */

	if (isInvestor) {
		return (
			<Container sx={{ height: '90%' }}>
				<DocumentsTable />
			</Container>
		);
	}

	/* -------------------------------------------------------------------------- */
	/*  DATA (MANAGER / USER ONLY)                                                */
	/* -------------------------------------------------------------------------- */

	let documentCount = 0;

	try {
		documentCount = await prisma.document.count({
			where: { userId },
		});
	} catch (error) {
		console.error('Error fetching document count:', error);
	}

	const isEmptyState = documentCount === 0;

	/* -------------------------------------------------------------------------- */
	/*  MANAGER / USER VIEW                                                       */
	/* -------------------------------------------------------------------------- */

	return (
		<Container
			sx={{
				height: '90%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: isEmptyState ? 'center' : 'flex-start',
				alignItems: 'center',
			}}
		>
			{isEmptyState ? (
				<>
					<BackgroundIcon backgroundPosition={0} />

					<Box
						display="flex"
						flexDirection="column"
						textAlign="center"
						width="100%"
						zIndex={1}
					>
						<Typography
							variant="h2"
							component="span"
							mb={{ sm: 5, md: 8, lg: 10 }}
						>
							Welcome to BlueWave DataHall
						</Typography>

						<List
							sx={{
								textAlign: 'left',
								maxWidth: '100%',
								mb: { sm: 12, md: 17, lg: 22 },
								mx: 'auto',
							}}
						>
							{[
								'Securely share files and manage permissions',
								'Keep your users updated with the latest documents',
								'Build trust with a professional user interface',
							].map((text) => (
								<ListItem key={text}>
									<ListItemIcon>
										<CheckCircleIcon width={20} height={20} />
									</ListItemIcon>
									<ListItemText
										slotProps={{ primary: { variant: 'h3' } }}
										primary={text}
									/>
								</ListItem>
							))}
						</List>

						<DragAndDropBox
							documentCount={documentCount}
							text="Drag and drop your first document here or click to upload"
						/>
					</Box>
				</>
			) : (
				<>
					<Box mb={{ sm: 8, md: 10, lg: 12 }} width="100%">
						<Typography variant="h2">Manage your documents</Typography>
						<Typography variant="h6">
							{documentCount} document{documentCount !== 1 ? 's' : ''}
						</Typography>
					</Box>

					<Box mb={{ sm: 8, md: 10, lg: 12 }} width="100%">
						<DragAndDropBox
							documentCount={documentCount}
							text="Drag and drop your document here or click to upload"
						/>
					</Box>

					<DocumentsTable />
				</>
			)}
		</Container>
	);
}
