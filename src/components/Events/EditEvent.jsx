import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { fetchEvent, queryClient, updateEvent } from "../../utils/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { QUERY_KEY } from "../../constants/queryKey.js";

export default function EditEvent() {
    const navigate = useNavigate();
    const params = useParams();

    const { data, isPending, isError, error } = useQuery({
        queryKey: [QUERY_KEY.EVENTS, { id: params.id }],
        queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
    });

    const { mutate } = useMutation({
        mutationFn: updateEvent,
        onMutate: async (payload) => {
            // payload là dữ liệu nhận được từ hàm mutate trả ra
            // On mutate, so this function here, will be executed right when you call mutate.
            // update the data that's cached by React Query

            const newEvent = payload.event;

            // to cancel all active queries for a specific key
            await queryClient.cancelQueries({ queryKey: [QUERY_KEY.EVENTS, { id: params.id }] });

            // get previous event (rollback if error occurred)
            const previousEvent = queryClient.getQueryData([QUERY_KEY.EVENTS, { id: params.id }]);

            queryClient.setQueryData([QUERY_KEY.EVENTS, { id: params.id }], newEvent);

            // trả về để hàm error có thể xử lý rollback
            return {
                previousEvent,
            };
        },
        onError: (error, data, context) => {
            // rolling back
            queryClient.setQueryData([QUERY_KEY.EVENTS, { id: params.id }], context.previousEvent);
        },
        onSettled: () => {
            // Xử lý đồng bộ dữ liệu từ phía client và server
            queryClient.invalidateQueries([QUERY_KEY.EVENTS, { id: params.id }]);
        },
    });

    // Hàm xử lý submit form
    function handleSubmit(formData) {
        mutate({
            id: params.id,
            event: formData,
        });

        navigate("../");
    }

    function handleClose() {
        navigate("../");
    }

    let content;

    if (isPending) {
        content = (
            <div className="center">
                <LoadingIndicator />
            </div>
        );
    }

    if (isError) {
        content = (
            <>
                <ErrorBlock title="Failed to load event" message={error.info?.message} />
                <div className="form-actions">
                    <Link to="../" className="button">
                        Okay
                    </Link>
                </div>
            </>
        );
    }

    if (data) {
        content = (
            <EventForm inputData={data} onSubmit={handleSubmit}>
                <Link to="../" className="button-text">
                    Cancel
                </Link>
                <button type="submit" className="button">
                    Update
                </button>
            </EventForm>
        );
    }

    return <Modal onClose={handleClose}>{content}</Modal>;
}
