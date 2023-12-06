import { Link, redirect, useNavigate, useNavigation, useParams, useSubmit } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { fetchEvent, queryClient, updateEvent } from "../../utils/http.js";
// import LoadingIndicator from "../UI/LoadingIndicator.jsx";
// import ErrorBlock from "../UI/ErrorBlock.jsx";
import { QUERY_KEY } from "../../constants/queryKey.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
    const navigate = useNavigate();
    const params = useParams();
    const submit = useSubmit();
    const { state } = useNavigation();

    const { data, isError, error } = useQuery({
        queryKey: [QUERY_KEY.EVENTS, { id: params.id }],
        queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
        staleTime: 10000,
    });

    // const { mutate } = useMutation({
    //     mutationFn: updateEvent,
    //     onMutate: async (payload) => {
    //         // payload là dữ liệu nhận được từ hàm mutate trả ra
    //         // On mutate, so this function here, will be executed right when you call mutate.
    //         // update the data that's cached by React Query

    //         const newEvent = payload.event;

    //         // to cancel all active queries for a specific key
    //         await queryClient.cancelQueries({ queryKey: [QUERY_KEY.EVENTS, { id: params.id }] });

    //         // get previous event (rollback if error occurred)
    //         const previousEvent = queryClient.getQueryData([QUERY_KEY.EVENTS, { id: params.id }]);

    //         queryClient.setQueryData([QUERY_KEY.EVENTS, { id: params.id }], newEvent);

    //         // trả về để hàm error có thể xử lý rollback
    //         return {
    //             previousEvent,
    //         };
    //     },
    //     onError: (error, data, context) => {
    //         // rolling back
    //         queryClient.setQueryData([QUERY_KEY.EVENTS, { id: params.id }], context.previousEvent);
    //     },
    //     onSettled: () => {
    //         // Xử lý đồng bộ dữ liệu từ phía client và server
    //         queryClient.invalidateQueries([QUERY_KEY.EVENTS, { id: params.id }]);
    //     },
    // });

    // Hàm xử lý submit form
    function handleSubmit(formData) {
        submit(formData, { method: "PUT" });
    }

    function handleClose() {
        navigate("../");
    }

    let content;

    // if (isPending) {
    //     content = (
    //         <div className="center">
    //             <LoadingIndicator />
    //         </div>
    //     );
    // }

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
                {state === "submitting" ? (
                    <button className="button">Sending data...</button>
                ) : (
                    <>
                        <Link to="../" className="button-text">
                            Cancel
                        </Link>
                        <button type="submit" className="button">
                            Update
                        </button>
                    </>
                )}
            </EventForm>
        );
    }

    return <Modal onClose={handleClose}>{content}</Modal>;
}

export function loader({ params }) {
    // Thay vì sử dụng hook ta có thể sử dụng hàm này thủ công
    return queryClient.fetchQuery({
        queryKey: [QUERY_KEY.EVENTS, { id: params.id }],
        queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
    });
}

export async function action({ request, params }) {
    const formData = await request.formData();

    const updatedEventData = Object.fromEntries(formData);

    await updateEvent({ id: params.id, event: updatedEventData });
    await queryClient.invalidateQueries({ queryKey: [QUERY_KEY.EVENTS] });

    return redirect("../");
}
