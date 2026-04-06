import type { IntakeFormData } from "@/core/types";
import { t } from "@/i18n";

export function validateIntakeForm(data: IntakeFormData) {
	const errs: Record<string, string> = {};
	if (!data.origin_city.trim()) errs.origin_city = t("whereFromError");
	if (!data.match_date) {
		errs.match_date = t("matchDateError");
	}
	if (!data.match_time) errs.match_time = t("matchTimeError");
	if (data.transport_modes.length === 0)
		errs.transport_modes = t("transportError");
	return errs;
}
