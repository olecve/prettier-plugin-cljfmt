(ns cljfmt-js.core
  (:require [cljfmt.core :as cljfmt]
            [clojure.string :as str]
            [cljs.reader :as reader]))

(defn format [source opts]
  (let [opts-clj (when (some? opts)
                   (js->clj opts :keywordize-keys true))]
    (if (empty? opts-clj)
      (cljfmt/reformat-string source)
      (cljfmt/reformat-string source opts-clj))))

(defn- blank? [s]
  (or (nil? s) (str/blank? s)))

(defn parse-config [config-edn]
  (when-not (blank? config-edn)
    (let [parsed (try
                   (reader/read-string config-edn)
                   (catch :default e
                     (throw (js/Error. (str "invalid EDN: " (.-message e))))))]
      (when-not (map? parsed)
        (throw (js/Error. "expected a top-level map")))
      nil)))

(defn format-with-config [source config-edn]
  (if (blank? config-edn)
    (cljfmt/reformat-string source)
    (let [parsed (reader/read-string config-edn)
          merged (merge cljfmt/default-options parsed)]
      (cljfmt/reformat-string source merged))))
