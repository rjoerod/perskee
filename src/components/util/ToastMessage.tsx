import React from "react";
import { toast } from "react-toastify";

const ToastMessage = (message: string) => {
	toast.error(
		<div style={{ display: "flex" }}>
			<div style={{ flexGrow: 1, fontSize: 15, padding: "8px 12px" }}>
				{message}
			</div>
		</div>
	);
};

ToastMessage.dismiss = toast.dismiss;

ToastMessage.dismiss = toast.dismiss;

export default ToastMessage;
