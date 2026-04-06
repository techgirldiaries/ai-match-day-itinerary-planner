/**
 * Form theme and styling utilities
 * Provides functions to build conditional class strings for form elements
 */

import { CSS_CLASSES } from "@/config/formConfig";

/**
 * Build input field class string based on error state
 * Combines base input styles with appropriate border color
 * @param hasError - Whether the field has validation error
 * @returns Combined class string
 */
export function buildFieldClass(hasError: boolean): string {
	return [
		CSS_CLASSES.inputBase,
		hasError ? CSS_CLASSES.inputError : CSS_CLASSES.inputBorder,
	].join(" ");
}

/**
 * Build transport option / chip class string based on selection state
 * Used for transport modes, interests, and accessibility pills
 * @param isChecked - Whether the option is selected
 * @returns Combined class string
 */
export function buildOptionClass(isChecked: boolean): string {
	return [
		CSS_CLASSES.transportOption,
		isChecked
			? CSS_CLASSES.transportOptionSelected
			: CSS_CLASSES.transportOptionUnselected,
	].join(" ");
}

/**
 * Alias for buildOptionClass - used for transport option styling
 * @param isChecked - Whether the option is selected
 * @returns Combined class string
 */
export const buildTransportOptionClass = buildOptionClass;

/**
 * Alias for buildOptionClass - used for chip/pill styling
 * @param isChecked - Whether the option is selected
 * @returns Combined class string
 */
export const buildChipClass = buildOptionClass;

/**
 * Build switch container class string based on toggle state
 * @param isOn - Whether the switch is toggled on
 * @returns Combined class string
 */
export function buildSwitchClass(isOn: boolean): string {
	return [
		CSS_CLASSES.switchContainer,
		isOn ? CSS_CLASSES.switchOn : CSS_CLASSES.switchOff,
	].join(" ");
}

/**
 * Build switch thumb class string based on toggle state
 * @param isOn - Whether the switch is toggled on
 * @returns Combined class string
 */
export function buildSwitchThumbClass(isOn: boolean): string {
	return [
		CSS_CLASSES.switchThumb,
		isOn ? CSS_CLASSES.switchThumbOn : CSS_CLASSES.switchThumbOff,
	].join(" ");
}
