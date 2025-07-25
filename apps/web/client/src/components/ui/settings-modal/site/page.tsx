import { useEditorEngine } from '@/components/store/editor';
import { api } from '@/trpc/react';
import { DefaultSettings } from '@onlook/constants';
import type { PageMetadata } from '@onlook/models';
import { toast } from '@onlook/ui/sonner';
import { memo } from 'react';
import { MetadataForm } from './metadata-form';
import { useMetadataForm } from './use-metadata-form';

export const PageTab = memo(({ metadata, path }: { metadata?: PageMetadata; path: string }) => {
    const editorEngine = useEditorEngine();
    const { data: project } = api.project.get.useQuery({ projectId: editorEngine.projectId });
    const { data: domains } = api.domain.getAll.useQuery({ projectId: editorEngine.projectId });
    const baseUrl = domains?.published?.url ?? domains?.preview?.url ?? project?.sandbox?.url;

    const {
        title,
        description,
        isDirty,
        uploadedImage,
        handleTitleChange,
        handleDescriptionChange,
        handleImageSelect,
        handleDiscard,
        setIsDirty,
    } = useMetadataForm({
        initialMetadata: metadata,
    });

    const handleSave = async () => {
        if (!project) {
            return;
        }
        try {
            const updatedMetadata: PageMetadata = {
                ...metadata,
                title,
                description,
                openGraph: {
                    ...metadata?.openGraph,
                    title: title,
                    description: description,
                    url: baseUrl || '',
                    siteName: title,
                    type: 'website',
                },
            };

            if (!metadata?.metadataBase) {
                const url = baseUrl?.startsWith('http') ? baseUrl : `https://${baseUrl}`;
                if (url) {
                    updatedMetadata.metadataBase = new URL(url);
                }
            }

            if (uploadedImage) {
                let imagePath;
                try {
                    await editorEngine.image.upload(uploadedImage, DefaultSettings.IMAGE_FOLDER);
                    imagePath = `/${uploadedImage.name}`;
                } catch (error) {
                    console.log(error);
                    return;
                }
                updatedMetadata.openGraph = {
                    ...updatedMetadata.openGraph,
                    images: [
                        {
                            url: imagePath,
                            width: 1200,
                            height: 630,
                            alt: title,
                        },
                    ],
                    type: 'website',
                };
            }

            await editorEngine.pages.updateMetadataPage(path, updatedMetadata);
            setIsDirty(false);
            toast.success('Page metadata has been updated successfully.');
        } catch (error) {
            console.error('Failed to update metadata:', error);
            toast.error('Failed to update page metadata. Please try again.');
        }
    };

    return (
        <div className="text-sm">
            <div className="flex flex-col gap-2 p-6">
                <h2 className="text-lg">Page Settings</h2>
            </div>
            <MetadataForm
                title={title}
                description={description}
                isDirty={isDirty}
                projectUrl={baseUrl}
                onTitleChange={handleTitleChange}
                onDescriptionChange={handleDescriptionChange}
                onImageSelect={handleImageSelect}
                onDiscard={handleDiscard}
                onSave={handleSave}
                currentMetadata={metadata}
            />
        </div>
    );
});

PageTab.displayName = 'PageTab';