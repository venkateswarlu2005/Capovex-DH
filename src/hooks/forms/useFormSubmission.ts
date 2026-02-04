/**
 * @deprecated (partial) – The legacy `onSubmit` fallback is deprecated.
 * Prefer the **adapter mode** using a `mutation`, which offers better integration with React Query DevTools,
 * error boundaries, and loading state handling.
 *
 * This hook itself is still supported for compatibility.
 * =============================================================================
 * A unified form‐submission hook that supports:
 *
 * 1️⃣ **Adapter mode** (preferred):
 *    – Pass a React-Query `mutation` (UseMutationResult).
 *    – `loading` and `error` mirror `mutation.isPending` / `mutation.error`.
 *    – You do **not** call `mutation.mutateAsync()` yourself.
 *    – Ideal for simple forms whose values map directly to the API payload.
 *
 * 2️⃣ **Legacy mode** (fallback):
 *    – Omit `mutation` and supply `onSubmit: async () => { … }`.
 *    – Hook manages its own `loading` / `error` via internal state.
 *    – Use when you need to transform values, set per-field errors,
 *      or chain multiple API calls before the final toast.
 *
 * **Example: CreateLink (legacy mode)**
 * ```ts
 * // needs payload transform + server-side alias conflict handling
 * const { loading, handleSubmit } = useFormSubmission({
 *   validate: () => isValid,
 *   onSubmit: async () => {
 *     try {
 *       const payload = getPayload();
 *       await createLink.mutateAsync({ documentId, payload });
 *     } catch (e) {
 *       // set field‐level errors, then rethrow for generic toast
 *       form.setError('alias', { message: e.message });
 *       throw e;
 *     }
 *   },
 *   successMessage: 'Link created!',
 *   errorMessage: 'Failed to create link.',
 * });
 * ```
 *
 * **Example: PasswordFormModal (adapter mode)**
 * ```ts
 * // form values pass straight through to the mutation
 * const { loading, handleSubmit } = useFormSubmission({
 *   mutation: changePassword,
 *   validate: () => isValid,
 *   successMessage: 'Password updated!',
 *   onError: (msg) => toast.showToast({ message: msg, variant: 'error' }),
 *   skipDefaultToast: true,
 * });
 * ```
 *
 * @param mutation       A TanStack Query `UseMutationResult`. When provided, the hook wires `loading` / `error` directly.
 * @param onSubmit       Fallback async callback (ignored if `mutation` is set).
 * @param validate       Optional synchronous predicate. Return `false` to abort.
 * @param getVariables   Optional function to retrieve variables for the mutation (if needed).
 * @param onSuccess      Optional callback after a successful submit.
 * @param onError        Optional callback on error (receives error message).
 * @param successMessage Optional toast text on success (unless `skipDefaultToast`).
 * @param errorMessage   Optional fallback toast text if the error is unstructured.
 * @param skipDefaultToast When `true`, the hook will not show automatic toasts.
 *
 * @returns `{ loading, error, handleSubmit, toast }`
 *  – `loading`: boolean
 *  – `error`: string
 *  – `handleSubmit`: attach to your `<form onSubmit={handleSubmit}>`
 *  – `toast`: the `useToast` instance for any additional notifications
 * =============================================================================
 */
import { FormEvent, useState } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useToast } from '@/hooks';
import { ValidationAbortError } from './useFormWithSchema';

// ... (imports remain the same)

// 1. Add <TData = any> to the interface
interface UseFormSubmissionProps<TData = any> {
    /** TanStack Query mutation; enables adapter mode when supplied. */
    mutation?: UseMutationResult<TData, unknown, any, unknown>;
    /** @deprecated Legacy fallback */
    onSubmit?: () => Promise<void>;
    validate?: () => boolean;
    getVariables?: () => any;
    // 2. Update onSuccess to accept TData
    onSuccess?: (data: TData) => void | Promise<void>; 
    onError?: (message: string) => void;
    successMessage?: string;
    errorMessage?: string;
    skipDefaultToast?: boolean;
}

// 3. Add <TData = any> to the hook function
export const useFormSubmission = <TData = any>({
    mutation,
    onSubmit,
    getVariables,
    validate,
    onSuccess,
    onError,
    successMessage,
    errorMessage,
    skipDefaultToast = false,
}: UseFormSubmissionProps<TData>) => {
    const [localLoading, setLocalLoading] = useState(false);
    const [localError, setLocalError] = useState('');
    const toast = useToast();

    const loading = mutation ? mutation.isPending : localLoading;
    const error = mutation ? ((mutation.error as any)?.message ?? '') : localError;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (validate && !validate()) return;

        try {
            let result: TData | undefined; // To capture the response

            if (mutation) {
                const variables = getVariables ? getVariables() : undefined;
                // 4. Capture the mutation result
                result = await mutation.mutateAsync(variables);
            } else if (onSubmit) {
                setLocalLoading(true);
                await onSubmit();
            }

            if (successMessage && !skipDefaultToast) {
                toast.showToast({ message: successMessage, variant: 'success' });
            }
            
            // 5. Pass the result to onSuccess
            onSuccess?.(result as TData); 
        } catch (err: any) {
            // ... (rest of error handling remains the same)
        } finally {
            if (!mutation) setLocalLoading(false);
        }
    };

    return { loading, error, handleSubmit, toast };
};