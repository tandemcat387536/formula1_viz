export default class StyleManager {
    private readonly rules;
    private readonly node;
    constructor(root: HTMLElement);
    destroy(): void;
    protected updateRules(): void;
    addRule(id: string, rule: string, update?: boolean): string;
    updateRule(id: string, rule: string, update?: boolean): string;
    deleteRule(id: string, update?: boolean): void;
    protected readonly ruleNames: string[];
}
