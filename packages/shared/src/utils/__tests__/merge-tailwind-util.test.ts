import { cn } from '../merge-tailwind-util';

describe('cn', () => {
    it('should merge multiple string classes', () => {
        const result = cn('class1', 'class2', 'class3');
        expect(result).toBe('class1 class2 class3');
    });

    it('should handle array inputs', () => {
        const result = cn(['class1', 'class2'], 'class3');
        expect(result).toBe('class1 class2 class3');
    });

    it('should handle object inputs with conditional classes', () => {
        const result = cn({ 'class1': true, 'class2': false, 'class3': true });
        expect(result).toBe('class1 class3');
    });

    it('should handle mixed input types', () => {
        const result = cn('base-class', ['conditional1', 'conditional2'], { 'optional': true, 'ignored': false });
        expect(result).toBe('base-class conditional1 conditional2 optional');
    });

    it('should handle empty inputs', () => {
        const result = cn();
        expect(result).toBe('');
    });

    it('should handle undefined and null values', () => {
        const result = cn('class1', undefined, null, 'class2');
        expect(result).toBe('class1 class2');
    });

    it('should handle falsy values correctly', () => {
        const isConditional = false;
        const isActive = true;
        const result = cn('class1', isConditional && 'conditional', isActive && 'active', 'class2');
        expect(result).toBe('class1 active class2');
    });

    it('should return empty string for no valid inputs', () => {
        const result = cn(undefined, null, false);
        expect(result).toBe('');
    });
});
