import { useState } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { QUERY_KEY } from "../../constants/queryKey.js";
import { deleteEvent, fetchEvent, queryClient } from "../../utils/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
    const [showPopupDelete, setShowPopupDelete] = useState(false);
    const params = useParams();
    const navigate = useNavigate();
    const { data, isPending, isError, error } = useQuery({
        queryKey: [QUERY_KEY.EVENTS, { id: params?.id }],
        queryFn: ({ signal }) => fetchEvent({ id: params?.id, signal }),
    });

    const {
        mutate,
        isPending: isPendingDel,
        isError: isErrorDel,
        error: errorDel,
    } = useMutation({
        mutationFn: deleteEvent,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEY.EVENTS],
                /**
                 * which makes sure that when you call invalidate queries, these existing queries will not automatically be triggered again immediately.
                 * Instead, they will just be invalidated and the next time they are required, they will run again.
                 */
                refetchType: "none",
            });

            navigate(-1);
        },
    });

    const handleOpenPopupDelete = () => {
        setShowPopupDelete(true);
    };

    const handleClosePopupDelete = () => {
        setShowPopupDelete(false);
    };

    // Hàm xử lý xoá event
    const handleDeleteEvent = () => {
        mutate({
            id: params.id,
        });
    };

    let content = <p>Not found item</p>;

    if (isPending)
        content = (
            <div className="center" id="event-details-content">
                <LoadingIndicator />;
            </div>
        );

    if (isError)
        content = (
            <div className="center" id="event-details-content">
                <ErrorBlock title="Failed to fetch event" message={error.info?.message} />
            </div>
        );

    if (data)
        content = (
            <>
                <header>
                    <h1>{data.title}</h1>
                    <nav>
                        <button onClick={handleOpenPopupDelete}>Delete</button>
                        <Link to="edit">Edit</Link>
                    </nav>
                </header>
                <div id="event-details-content">
                    <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
                    <div id="event-details-info">
                        <div>
                            <p id="event-details-location">{data.location}</p>
                            <time dateTime={`Todo-DateT$Todo-Time`}>
                                {data.date} @ {data.time}
                            </time>
                        </div>
                        <p id="event-details-description">{data.description}</p>
                    </div>
                </div>
            </>
        );

    return (
        <>
            {showPopupDelete && (
                <Modal onClose={handleClosePopupDelete}>
                    <h2>Are you sure?</h2>
                    <p>Do you really want to delete this event? This action cannot be undone</p>
                    <div className="form-actions">
                        {isPendingDel && <p>Deleting, please wait...</p>}
                        {!isPendingDel && (
                            <>
                                <button className="button-text" onClick={handleClosePopupDelete}>
                                    Cancel
                                </button>
                                <button className="button" onClick={handleDeleteEvent}>
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                    {isErrorDel && (
                        <ErrorBlock
                            title="Failed to delete event!"
                            message={errorDel.info?.message}
                        />
                    )}
                </Modal>
            )}
            <Outlet />
            <Header>
                <Link to="/events" className="nav-item">
                    View all Events
                </Link>
            </Header>

            <article id="event-details">{content}</article>
        </>
    );
}
