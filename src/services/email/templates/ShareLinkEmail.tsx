import { Button } from '@react-email/button';
import { Container } from '@react-email/container';
import { Heading } from '@react-email/heading';
import { Hr } from '@react-email/hr';
import { Html } from '@react-email/html';
import { Img } from '@react-email/img';
import { Section } from '@react-email/section';
import { Text } from '@react-email/text';
import { Link } from '@react-email/link';

export const subject = (doc: string) => `Datahall | A file was shared with you: ${doc}`;
export const label = 'Link Shared Email';

interface ShareLinkEmailProps {
	linkUrl: string;
	fileName?: string;
	senderName?: string | null;
	recipientName?: string | null;
}

export function ShareLinkEmail({
	linkUrl,
	fileName,
	senderName,
	recipientName,
}: ShareLinkEmailProps) {
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
						alt='Datahall'
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
					{senderName ? `${senderName} shared a file` : 'A file was shared with you'} via{' '}
					<strong>Datahall</strong>
				</Text>

				<Text style={{ fontSize: '16px', lineHeight: '24px', marginBottom: '16px' }}>
					<strong>{fileName ? `File: ${fileName}` : ''}</strong>.
				</Text>

				<Section style={{ textAlign: 'center', marginBottom: '32px' }}>
					<Button
						href={linkUrl}
						style={{
							backgroundColor: '#2563eb',
							color: '#ffffff',
							fontSize: '16px',
							padding: '12px 24px',
							borderRadius: '6px',
							textDecoration: 'none',
						}}>
						Open File
					</Button>
				</Section>

				{/* Raw clickable link */}
				<Text style={{ fontSize: '14px', textAlign: 'center', marginBottom: '24px' }}>
					Or open directly:{' '}
					<a
						href={linkUrl}
						style={{ color: '#2563eb', wordBreak: 'break-all' }}>
						{linkUrl}
					</a>
				</Text>

				<Text style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center' }}>
					If you weren’t expecting this file, you can safely ignore this email.
				</Text>

				<Hr style={{ margin: '32px 0', borderColor: '#e5e7eb' }} />

				<Text style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
					© {new Date().getFullYear()} Datahall. All rights reserved.
				</Text>
			</Container>
		</Html>
	);
}

export default ShareLinkEmail;
