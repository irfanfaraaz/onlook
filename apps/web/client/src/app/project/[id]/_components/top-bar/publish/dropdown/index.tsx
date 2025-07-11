import { useEditorEngine } from '@/components/store/editor';
import { PublishStatus } from '@onlook/models';
import { Separator } from '@onlook/ui/separator';
import { observer } from 'mobx-react-lite';
import { AdvancedSettingsSection } from './advanced-settings';
import { CustomDomainSection } from './custom-domain-section';
import { LoadingState } from './loading';
import { PreviewDomainSection } from './preview-domain-section';

export const PublishDropdown = observer(() => {
    const editorEngine = useEditorEngine();
    const state = editorEngine.hosting.state;

    return (
        <div className="rounded-md flex flex-col text-foreground-secondary">
            {state.status === PublishStatus.LOADING ? <LoadingState /> : (
                <>
                    <PreviewDomainSection />

                    <Separator />
                    <CustomDomainSection />
                    <Separator />
                    <AdvancedSettingsSection />
                </>
            )}
        </div>
    );
});
