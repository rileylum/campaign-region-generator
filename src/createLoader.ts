import type { Extent } from 'ol/extent';
import { type Projection, transformExtent } from 'ol/proj';
import type { LoadingStrategy } from 'ol/source/Vector';
import { all } from 'ol/loadingstrategy';
import { deserialize } from 'flatgeobuf/lib/mjs/ol';
import type VectorSource from 'ol/source/Vector';
import type { FeatureLoader } from 'ol/featureloader';
import type Feature from 'ol/Feature';
import { ErrorHandler } from './utils/errorHandler';

async function createIterator(
  url: string,
  srs: string,
  extent: Extent,
  projection: Projection,
  strategy: LoadingStrategy
) {
  if (strategy === all) {
    const response = await fetch(url);
    return deserialize(response.body || '');
  } else {
    const [minX, minY, maxX, maxY] =
      srs && projection.getCode() !== srs
        ? transformExtent(extent, projection.getCode(), srs)
        : extent;
    const rect = { minX, minY, maxX, maxY };
    return deserialize(url, rect);
  }
}

function createLoader(
  source: VectorSource,
  url: string,
  srs = 'EPSG:4326',
  strategy: LoadingStrategy = all,
  clear = false
): FeatureLoader<Feature> {
  const loader: FeatureLoader<Feature> = async (
    extent,
    _resolution,
    projection,
    success,
    failure
  ) => {
    try {
      if (clear) source.clear();
      const it = await createIterator(url, srs, extent, projection, strategy);
      for await (const feature of it) {
        if (srs && projection.getCode() !== srs) {
          feature.getGeometry()?.transform(srs, projection.getCode());
        }
        source.addFeature(feature);
      }
      success?.(source.getFeatures());
    } catch (error) {
      ErrorHandler.handleFeatureLoadError(url, error, 'error');
      failure?.();
    }
  };
  return loader;
}

export default createLoader;
