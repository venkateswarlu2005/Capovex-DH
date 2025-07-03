import { Html } from '@react-email/html';
import { Container } from '@react-email/container';
import { Heading } from '@react-email/heading';
import { Text } from '@react-email/text';
import { Button } from '@react-email/button';
import { Img } from '@react-email/img';
import { Section } from '@react-email/section';
import { Hr } from '@react-email/hr';

export const subject = 'Datahall | A document was shared with you';
export const label = 'Document Shared Email';

export function DocumentSharedEmail({
	recipientName,
	senderName,
	documentName,
	linkUrl,
}: {
	recipientName?: string;
	senderName: string;
	documentName: string;
	linkUrl: string;
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
					<strong>{senderName}</strong> has shared a document with you via <strong>Datahall</strong>
					.
				</Text>

				<Text style={{ fontSize: '16px', lineHeight: '24px', marginBottom: '16px' }}>
					Document: <strong>{documentName}</strong>
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
						View Document
					</Button>
				</Section>

				<Text style={{ fontSize: '14px', textAlign: 'center', lineHeight: '22px' }}>
					If you weren’t expecting this document, you can safely ignore this email.
				</Text>

				<Hr style={{ margin: '32px 0', borderColor: '#e5e7eb' }} />

				<Text style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
					© {new Date().getFullYear()} Datahall. All rights reserved.
				</Text>
			</Container>
		</Html>
	);
}

export default DocumentSharedEmail;
