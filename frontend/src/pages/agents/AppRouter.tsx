import type { FunctionComponent } from "preact";
import { currentRoute } from "../../core/signals";
import { IntakeForm } from "../intake/IntakeForm";
import { ChatRoute } from "./app-routes/chat-route";

export const AppRouter: FunctionComponent = () => {
	const route = currentRoute.value;

	switch (route) {
		case "intake":
			return <IntakeForm />;
		case "chat":
			return <ChatRoute />;
		default: {
			// Exhaustive check — errors at compile time if
			// AppRoute grows and not handled:
			const _exhaustiveCheck: never = route;
			return _exhaustiveCheck;
		}
	}
};
