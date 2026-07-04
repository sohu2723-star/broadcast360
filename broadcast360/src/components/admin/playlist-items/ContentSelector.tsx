"use client";

import { PlaylistItemType } from "@/types/playlist-item";

import MovieSelector from "./MovieSelector";
import EpisodeSelector from "./EpisodeSelector";
import AdSelector from "./AdSelector";
import SeriesSelector from "./SeriesSelector";


interface Props {

  type: PlaylistItemType;

  seriesId: number | null;

  setSeriesId: (id:number | null)=>void;

  value: number | null;

  onSelect: (id:number)=>void;

}



export default function ContentSelector({

  type,

  seriesId,

  setSeriesId,

  value,

  onSelect

}: Props) {



switch(type){


case "MOVIE":

return (

<MovieSelector

value={value}

onSelect={onSelect}

/>

);



case "SERIES":

return (

<>

<SeriesSelector

value={seriesId}

onSelect={setSeriesId}

/>


<EpisodeSelector

seriesId={seriesId}

value={value}

onSelect={onSelect}

/>

</>

);



case "ADVERTISEMENT":

return (

<AdSelector

value={value}

onSelect={onSelect}

/>

);



default:

return (

<p className="text-gray-400">

Select content type

</p>

);


}


}