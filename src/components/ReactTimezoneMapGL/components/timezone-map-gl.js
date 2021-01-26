import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { compose, withProps, defaultProps } from "recompose";
import { fromJS } from "immutable";
import MapGL, { NavigationControl } from "react-map-gl";
import DeckGL, { GeoJsonLayer } from "deck.gl";
import { DateTime, Info } from "luxon";
import MAP_STYLE from "./basic-v9.json";
import { withSource } from "./context";
import timezoneParser from "../utils/timezoneParser";

const findLayer = (id) =>
  fromJS(MAP_STYLE)
    .get("layers")
    .findIndex((layer) => layer.get("id") === id);

const FIND_NE_FILL_LAYER = findLayer("timezone-fill");

const Tooltip = styled.div`
  position: absolute;
  padding: 4px 16px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  font-size: 16px;
  z-index: 10;
  pointer-events: none;
  border-radius: 4px;
`;

const NavigationControlWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  padding: 10px;
`;

const TimezoneMapGL = (props) => {
  const [state, setState] = useState({
    hoveredFeature: null,
    neTimeZoneFeature: null,
    lngLat: null,
    mapStyle: null,
    viewport: {
      width: 1030,
      height: 750,
      latitude: 0,
      longitude: 0,
      zoom: 1.8,
      bearing: 0,
      pitch: 0,
    },
  });

  const { defaultMapStyle, defaultViewport } = props;

  useEffect(() => {
    setState((prev) =>
      Object.assign({}, prev, {
        mapStyle: defaultMapStyle,
      })
    );
  }, [defaultMapStyle]);

  useEffect(() => {
    let newViewport = { ...state.viewport };
    newViewport.width = defaultViewport.width;
    newViewport.height = defaultViewport.height;
    setState((prev) =>
      Object.assign({}, prev, {
        viewport: newViewport,
      })
    );
  }, [defaultViewport]);

  const updateViewport = (viewport) => {
    setState((prev) => Object.assign({}, prev, { viewport }));
  };

  const handleMouseOut = () =>
    setState((prev) =>
      Object.assign({}, prev, { hoveredFeature: null, neTimeZoneFeature: null, lngLat: null })
    );

  const handleHover = (event) => {
    const {
      features,
      lngLat,
      srcEvent: { offsetX, offsetY },
    } = event;
    const { mapStyle } = state;

    const hoveredFeature =
      features && features.find((f) => f.layer.id === "timezone-boundary-builder-fill");

    let neTimeZoneFeature;
    if (!hoveredFeature) {
      neTimeZoneFeature = features && features.find((f) => f.layer.id === "timezone-fill");
    }

    const newState = {};
    let newMapStyle = { ...mapStyle };
    if (hoveredFeature) {
      newState.hoveredFeature = hoveredFeature;
      newState.neTimeZoneFeature = null;
    } else if (neTimeZoneFeature) {
      newState.neTimeZoneFeature = neTimeZoneFeature;
      newState.hoveredFeature = null;
      newMapStyle["layers"][FIND_NE_FILL_LAYER]["paint"]["fill-opacity"][1][1][2] =
        neTimeZoneFeature.properties.objectid;
    }
    setState((prev) =>
      Object.assign({}, prev, {
        lngLat,
        x: offsetX,
        y: offsetY,
        mapStyle: newMapStyle,
        ...newState,
      })
    );
  };

  const handleClick = (event) => {
    const { onTimezoneClick } = props;
    const { hoveredFeature } = state;
    const tzid = hoveredFeature && hoveredFeature.properties && hoveredFeature.properties.tzid;

    if (onTimezoneClick && tzid) {
      onTimezoneClick(event, tzid);
    }
  };

  const renderTooltip = () => {
    const { x, y, hoveredFeature, lngLat } = state;
    if (!hoveredFeature || !lngLat) return null;

    const dt = DateTime.local().setZone(hoveredFeature.properties.tzid);

    return (
      <Tooltip style={{ top: y, left: x }}>
        <p>
          {dt.offsetNameLong} ({dt.offsetNameShort})
        </p>
        <p>{dt.zoneName}</p>
        <p>
          {DateTime.local().setZone(hoveredFeature.properties.tzid).toLocaleString({
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      </Tooltip>
    );
  };

  const renderNeTooltip = () => {
    const { x, y, neTimeZoneFeature, lngLat } = state;

    if (!neTimeZoneFeature || !lngLat) return null;
    var dt = DateTime.local().setZone(timezoneParser(neTimeZoneFeature.properties.time_zone), {
      keepLocalTime: false,
    });

    return (
      neTimeZoneFeature && (
        <Tooltip style={{ top: y, left: x }}>
          <p>
            {dt.offsetNameLong} ({dt.zoneName})
          </p>
          <p>
            {dt.toLocaleString({
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </Tooltip>
      )
    );
  };

  const renderSelectOrHoveredTimezone = () => {
    const { source, timezone } = props;
    const { viewport, hoveredFeature, lngLat, neTimeZoneFeature } = state;

    const layers = [];
    if (timezone && Info.isValidIANAZone(timezone)) {
      const data = source.timezoneBoundaryBuilder.features.find(
        (feature) => feature.properties.tzid === timezone
      );
      layers.push(
        new GeoJsonLayer({
          id: "select-timezone-layer",
          data,
          pickable: true,
          stroked: false,
          filled: true,
          extruded: true,
          lineWidthScale: 20,
          lineWidthMinPixels: 2,
          getFillColor: [255, 0, 0, 150],
          getRadius: 100,
          getLineWidth: 1,
          getElevation: 30,
        })
      );
    }

    if (hoveredFeature && lngLat) {
      const data = source.timezoneBoundaryBuilder.features.find(
        (feature) => feature.properties.tzid === hoveredFeature.properties.tzid
      );

      layers.push(
        new GeoJsonLayer({
          id: "geojson-layer",
          data,
          pickable: true,
          stroked: false,
          filled: true,
          extruded: true,
          lineWidthScale: 20,
          lineWidthMinPixels: 2,
          getFillColor: [129, 69, 46, 120],
          getRadius: 100,
          getLineWidth: 1,
          getElevation: 30,
        })
      );
    }

    return <DeckGL {...viewport} layers={layers} />;
  };

  const mapboxApiAccessToken = props.mapboxApiAccessToken;

  const { mapStyle, viewport } = state;

  return (
    <div onClick={handleClick} onMouseOut={handleMouseOut}>
      <MapGL
        {...viewport}
        minZoom={1}
        maxZoom={6}
        mapStyle={mapStyle}
        onHover={handleHover}
        onViewportChange={updateViewport}
        mapboxApiAccessToken={mapboxApiAccessToken}
        doubleClickZoom={false}
        // scrollZoom={false}
      >
        {renderTooltip()}
        {renderNeTooltip()}
        {renderSelectOrHoveredTimezone()}
        <NavigationControlWrapper>
          <NavigationControl onViewportChange={updateViewport} />
        </NavigationControlWrapper>
      </MapGL>
    </div>
  );
};

TimezoneMapGL.propTypes = {
  defaultMapStyle: PropTypes.object,
  defaultViewport: PropTypes.object,
  mapboxApiAccessToken: PropTypes.string.isRequired,
  timezone: PropTypes.string,
  onTimezoneClick: PropTypes.func,
};

TimezoneMapGL.defaultProps = {
  timezone: null,
  defaultViewport: {
    width: 1030,
    height: 750,
    latitude: 0,
    longitude: 0,
    zoom: 1,
    bearing: 0,
    pitch: 0,
  },
};

export default compose(
  withSource,
  defaultProps({
    defaultMapStyle: MAP_STYLE,
    mapboxApiAccessToken:
      "pk.eyJ1Ijoicm9taWthcyIsImEiOiJjazg0b2ZrOWcwc25mM29xdHFlMHdwenpsIn0.EpdSDBQASiP_K00nvaMMRA",
  }),
  withProps(({ source, defaultMapStyle }) => {
    let finalDefaultMapStyle = defaultMapStyle;
    finalDefaultMapStyle["sources"]["timezone-source"] = {
      type: "geojson",
      data: source.naturalEarth,
    };
    finalDefaultMapStyle["sources"]["timezone-boundary-builder"] = {
      type: "geojson",
      data: source.timezoneBoundaryBuilder,
    };
    return {
      defaultMapStyle: finalDefaultMapStyle,
    };
  })
)(TimezoneMapGL);
