import { Html } from '@react-email/html';
import { Container } from '@react-email/container';
import { Heading } from '@react-email/heading';
import { Text } from '@react-email/text';
import { Button } from '@react-email/button';
import { Img } from '@react-email/img';
import { Section } from '@react-email/section';
import { Hr } from '@react-email/hr';

export const subject = 'Datahall | You’ve been invited to join a team';
export const label = 'Invitation Email';

export function InvitationEmail({
	recipientName,
	senderName,
	inviteUrl,
}: {
	recipientName?: string;
	senderName: string;
	inviteUrl: string;
}) {
	return (
		<Html>
			<Container
				style={{
					padding: '32px',
					fontFamily: 'sans-serif',
					backgroundColor: '#ffffff',
					maxWidth: '600px',
				}}>
				<Section style={{ textAlign: 'center', marginBottom: '24px' }}>
					<Img
						src='https://utfs.io/f/fYAncjDxKRb0SB5lSuLK58qIuaP0cF3tMzrJCA4G92LHNofp'
						width='100'
						alt='Bluewave Labs'
					/>
				</Section>

				<Heading
					as='h1'
					style={{
						fontSize: '24px',
						fontWeight: 'bold',
						marginBottom: '16px',
						textAlign: 'center',
					}}>
					{recipientName ? `Hi ${recipientName},` : 'Hello,'}
				</Heading>

				<Text style={{ fontSize: '16px', lineHeight: '24px', marginBottom: '24px' }}>
					<strong>{senderName}</strong> has invited you to join their team on{' '}
					<strong>Datahall</strong>.
				</Text>

				<Section style={{ textAlign: 'center', marginBottom: '32px' }}>
					<Button
						href={inviteUrl}
						style={{
							backgroundColor: '#2563eb',
							color: '#ffffff',
							fontSize: '16px',
							padding: '12px 24px',
							borderRadius: '6px',
							textDecoration: 'none',
						}}>
						Accept Invitation
					</Button>
				</Section>

				<Text style={{ fontSize: '14px', lineHeight: '22px', textAlign: 'center' }}>
					If you don’t want to join this team, you can safely ignore this email.
				</Text>

				<Hr style={{ margin: '32px 0', borderColor: '#e5e7eb' }} />

				<Text style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
					© {new Date().getFullYear()} Datahall. All rights reserved.
				</Text>
			</Container>
		</Html>
	);
}

export default InvitationEmail;
