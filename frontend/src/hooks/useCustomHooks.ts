/**
 * Custom preact hooks for common patterns
 * Simplifies form handling, state management and side effects
 */

import { useCallback, useEffect, useRef, useState } from "preact/hooks";

/**
 * Hook for handling form field state with validation
 * @param initialValue - Initial field value
 * @param validate - Optional validation function
 * @returns Object with value, setters and validation state
 * @example
 * const field = useField("", (val) => val.length > 0 ? "" : "Required")
 * <input value={field.value} onInput={(e) => field.setValue(e.target.value)} />
 * {field.error && <p>{field.error}</p>}
 */
export function useField<T>(initialValue: T, validate?: (value: T) => string) {
	const [value, setValue] = useState(initialValue);
	const [error, setError] = useState("");
	const [touched, setTouched] = useState(false);

	const handleChange = useCallback(
		(newValue: T) => {
			setValue(newValue);
			if (validate && touched) {
				const validationError = validate(newValue);
				setError(validationError);
			}
		},
		[validate, touched],
	);

	const handleBlur = useCallback(() => {
		setTouched(true);
		if (validate) {
			const validationError = validate(value);
			setError(validationError);
		}
	}, [validate, value]);

	const reset = useCallback(() => {
		setValue(initialValue);
		setError("");
		setTouched(false);
	}, [initialValue]);

	return {
		value,
		setValue: handleChange,
		error,
		touched,
		setTouched,
		reset,
	};
}

/**
 * Hook for managing async operations with loading and error states
 * @param fn - Async function to execute
 * @param immediate - Whether to execute immediately (default: false)
 * @returns Object with loading, error, data and execute function
 * @example
 * const { data, loading, error, execute } = useAsync(fetchData)
 * <button onClick={execute}>Load Data</button>
 * {loading && <p>Loading...</p>}
 * {error && <p>Error: {error.message}</p>}
 */
export function useAsync<T>(fn: () => Promise<T>, immediate: boolean = false) {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const execute = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const result = await fn();
			setData(result);
			setLoading(false);
			return result;
		} catch (err) {
			const error = err instanceof Error ? err : new Error(String(err));
			setError(error);
			setLoading(false);
			throw error;
		}
	}, [fn]);

	useEffect(() => {
		if (immediate) {
			execute();
		}
	}, [immediate, execute]);

	return {
		data,
		loading,
		error,
		execute,
	};
}

/**
 * Hook for managing boolean toggle state
 * @param initialValue - Initial state value
 * @returns Object with value and methods to toggle/set
 * @example
 * const { value: isOpen, toggle } = useToggle(false)
 * <button onClick={toggle}>Toggle</button>
 * {isOpen && <div>Content</div>}
 */
export function useToggle(initialValue: boolean = false) {
	const [value, setValue] = useState(initialValue);

	const toggle = useCallback(() => {
		setValue((prev) => !prev);
	}, []);

	return {
		value,
		toggle,
		setValue,
	};
}

/**
 * Hook for managing previous value
 * @param value - Current value to track
 * @returns Previous value
 * @example
 * const prevCount = usePrevious(count)
 * useEffect(() => {
 *   if (prevCount !== count) { /* handle change * / }
 * }, [count])
 */
export function usePrevious<T>(value: T): T | undefined {
	const ref = useRef<T>();

	useEffect(() => {
		ref.current = value;
	}, [value]);

	return ref.current;
}

/**
 * Hook for debouncing a function
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 * @example
 * const debouncedSearch = useDebounce((txt) => search(txt), 300)
 * <input onInput={(e) => debouncedSearch(e.target.value)} />
 */
export function useDebounce<T extends (...args: unknown[]) => unknown>(
	callback: T,
	delay: number,
): T {
	const timeoutRef = useRef<number | null>(null);

	const debounced = useCallback(
		(...args: unknown[]) => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			timeoutRef.current = window.setTimeout(() => callback(...args), delay);
		},
		[callback, delay],
	) as T;

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	return debounced;
}

/**
 * Hook for managing local storage with syncing
 * @param key - Storage key
 * @param initialValue - Initial value if key doesn't exist
 * @returns Tuple of [value, setter]
 * @example
 * const [darkMode, setDarkMode] = useLocalStorage("darkMode", false)
 * <button onClick={() => setDarkMode(!darkMode)}>Toggle</button>
 */
export function useLocalStorage<T>(
	key: string,
	initialValue: T,
): [T, (value: T) => void] {
	const [value, setValue] = useState<T>(() => {
		try {
			const stored = localStorage.getItem(key);
			return stored ? JSON.parse(stored) : initialValue;
		} catch (error) {
			console.error(`Failed to read from localStorage[${key}]:`, error);
			return initialValue;
		}
	});

	const setStoredValue = useCallback(
		(newValue: T) => {
			try {
				setValue(newValue);
				localStorage.setItem(key, JSON.stringify(newValue));
			} catch (error) {
				console.error(`Failed to write to localStorage[${key}]:`, error);
			}
		},
		[key],
	);

	return [value, setStoredValue];
}

/**
 * Hook for handling click outside detection
 * @param ref - Reference to element to detect outside clicks on
 * @param callback - Function to call when clicking outside
 * @example
 * const ref = useRef<HTMLDivElement>(null)
 * useClickOutside(ref, () => setIsOpen(false))
 * <div ref={ref}>Content</div>
 */
export function useClickOutside(
	ref: React.RefObject<HTMLElement>,
	callback: () => void,
): void {
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (ref.current && !ref.current.contains(event.target as Node)) {
				callback();
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [callback, ref]);
}
