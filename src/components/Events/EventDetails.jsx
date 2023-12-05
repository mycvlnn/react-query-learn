import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { QUERY_KEY } from "../../constants/queryKey.js";
import { deleteEvent, fetchEvent, queryClient } from "../../utils/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EventDetails() {
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
            });

            navigate(-1);
        },
    });

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
                        {!isPendingDel && <button onClick={handleDeleteEvent}>Delete</button>}
                        {isPendingDel && <button>Deleting...</button>}
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
            <Outlet />
            <Header>
                <Link to="/events" className="nav-item">
                    View all Events
                </Link>
            </Header>
            {isErrorDel && (
                <ErrorBlock title="Failed to delete event!" message={errorDel.info?.message} />
            )}
            <article id="event-details">{content}</article>
        </>
    );
}
