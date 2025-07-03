import { Html } from '@react-email/html';
import { Container } from '@react-email/container';
import { Heading } from '@react-email/heading';
import { Text } from '@react-email/text';
import { Img } from '@react-email/img';
import { Section } from '@react-email/section';
import { Hr } from '@react-email/hr';

export const subject = 'Datahall | Your document was viewed';
export const label = 'View Notification Email';

export function ViewNotificationEmail({
	name,
	documentName,
	viewedAt,
}: {
	name?: string;
	documentName: string;
	viewedAt: string;
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
					{name ? `Hi ${name},` : 'Hello,'}
				</Heading>

				<Text style={{ fontSize: '16px', lineHeight: '24px', marginBottom: '24px' }}>
					Just a quick update — your document <strong>"{documentName}"</strong> was viewed on{' '}
					<strong>{viewedAt}</strong>.
				</Text>

				<Text style={{ fontSize: '14px', lineHeight: '22px', marginBottom: '32px' }}>
					If you were expecting this, great! Otherwise, you might want to check your sharing
					settings or reach out to your team.
				</Text>

				<Hr style={{ margin: '32px 0', borderColor: '#e5e7eb' }} />

				<Text style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
					© {new Date().getFullYear()} Datahall. All rights reserved.
				</Text>
			</Container>
		</Html>
	);
}

export default ViewNotificationEmail;
