import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import EventItem from "./EventItem.jsx";
import { useQuery } from "@tanstack/react-query";
import { fetchEvents } from "../../utils/http.js";
import { QUERY_KEY } from "../../constants/queryKey.js";

export default function NewEventsSection() {
    const { data, isPending, isError, error } = useQuery({
        queryKey: [QUERY_KEY.EVENTS, { max: 3 }],
        queryFn: ({ signal, queryKey }) => fetchEvents({ signal, ...queryKey[1] }),
    });

    let content;

    if (isPending) {
        content = <LoadingIndicator />;
    }

    if (isError) {
        content = (
            <ErrorBlock
                title="An error occurred"
                message={error.info?.message || "Faild to fetch events."}
            />
        );
    }

    if (data) {
        content = (
            <ul className="events-list">
                {data.map((event) => (
                    <li key={event.id}>
                        <EventItem event={event} />
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <section className="content-section" id="new-events-section">
            <header>
                <h2>Recently added events</h2>
            </header>
            {content}
        </section>
    );
}
