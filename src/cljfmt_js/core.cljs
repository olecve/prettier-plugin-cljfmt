(ns cljfmt-js.core
  (:require [cljfmt.core :as cljfmt]
            [cljs.reader :as reader]))

(defn format [source opts]
  (let [opts-clj (when (some? opts)
                   (js->clj opts :keywordize-keys true))]
    (if (empty? opts-clj)
      (cljfmt/reformat-string source)
      (cljfmt/reformat-string source opts-clj))))

(defn format-with-config [source config-edn]
  (if (or (nil? config-edn) (= "" config-edn))
    (cljfmt/reformat-string source)
    (let [parsed (reader/read-string config-edn)
          merged (merge cljfmt/default-options parsed)]
      (cljfmt/reformat-string source merged))))
