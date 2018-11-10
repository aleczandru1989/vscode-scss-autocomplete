import {
    CancellationToken,
    CompletionContext,
    CompletionItem,
    CompletionItemProvider,
    CompletionList,
    Position,
    ProviderResult,
    TextDocument,
} from 'vscode';

export class AutocompleteService implements CompletionItemProvider {
    public provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, context: CompletionContext): ProviderResult<CompletionItem[] | CompletionList> {
        return new Promise((resolve) => {
            resolve([
                new CompletionItem('Spartan'),
                new CompletionItem('fsafsaSpartasan'),
                new CompletionItem('sdsSpfsafssfsrtan'),
                new CompletionItem('sasfsaSsaparsfsaftan'),
                new CompletionItem('Spartadgagan'),
                new CompletionItem('Sagsasfpartan'),
                new CompletionItem('Sasgsagsapartan'),
                new CompletionItem('Spargsatasan'),
                new CompletionItem('Sgsagasgpartan'),
                new CompletionItem('Spteqtartan'),
                new CompletionItem('Spavzxrwrtan'),
                new CompletionItem('Spartvdvvfan'),
            ]);
        });
    }
}