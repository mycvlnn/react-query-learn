import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchEvents } from "../../utils/http";
import LoadingIndicator from "../UI/LoadingIndicator";
import ErrorBlock from "../UI/ErrorBlock";
import EventItem from "./EventItem";

export default function FindEventSection() {
    const searchElement = useRef();

    const [searchTerm, setSearchTerm] = useState(undefined);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: [
            "events",
            {
                search: searchTerm,
            },
        ],
        queryFn: ({ signal }) => fetchEvents({ searchTerm, signal }),
        enabled: searchTerm !== undefined,
    });

    let content = <p>Please enter a search term add to find events</p>;

    if (isLoading) {
        content = <LoadingIndicator />;
    }

    if (isError)
        content = (
            <ErrorBlock
                title="An error occured"
                message={error.info?.message || "Failed to fetch events"}
            />
        );

    if (data) {
        content = (
            <ul className="events-list">
                {data.map((event) => (
                    <li key={event.id} className="">
                        <EventItem event={event} />
                    </li>
                ))}
            </ul>
        );
    }

    function handleSubmit(event) {
        event.preventDefault();
        console.log({ event });
        setSearchTerm(searchElement.current.value);
    }

    return (
        <section className="content-section" id="all-events-section">
            <header>
                <h2>Find your next event!</h2>
                <form onSubmit={handleSubmit} id="search-form">
                    <input
                        type="search"
                        placeholder="Search events"
                        ref={searchElement}
                        name="search_event"
                    />
                    <button>Search</button>
                </form>
            </header>
            {content}
        </section>
    );
}
