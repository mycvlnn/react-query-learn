import { Link, useNavigate } from "react-router-dom";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { useMutation } from "@tanstack/react-query";
import { createNewEvent } from "../../utils/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { queryClient } from "../../utils/http.js";
import { QUERY_KEY } from "../../constants/queryKey.js";

export default function NewEvent() {
    const navigate = useNavigate();
    const { mutate, isPending, isError, error } = useMutation({
        mutationFn: createNewEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEY.EVENTS],
            });
            // Chỉ chạy vào hàm này trong trường hợp thành công
            navigate("/events");
        },
    });

    function handleSubmit(formData) {
        console.log({ formData });
        mutate({ event: formData });
    }

    return (
        <Modal onClose={() => navigate("../")}>
            <EventForm onSubmit={handleSubmit}>
                {isPending && (
                    <button type="submit" className="button">
                        Submitting...
                    </button>
                )}
                {!isPending && (
                    <>
                        <Link to="../" className="button-text">
                            Cancel
                        </Link>
                        <button type="submit" className="button">
                            Create
                        </button>
                    </>
                )}
            </EventForm>
            {isError && (
                <ErrorBlock
                    title="Failed to create event"
                    message={
                        error.info?.message ||
                        "Failed to create event. Please check your inputs and try again later."
                    }
                />
            )}
        </Modal>
    );
}
