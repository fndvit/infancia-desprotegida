
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity$3 = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_custom_element_data(node, prop, value) {
        if (prop in node) {
            node[prop] = typeof node[prop] === 'boolean' && value === '' ? true : value;
        }
        else {
            attr(node, prop, value);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity$3, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* node_modules/@sveltejs/svelte-scroller/Scroller.svelte generated by Svelte v3.38.2 */

    const { window: window_1 } = globals;
    const file$g = "node_modules/@sveltejs/svelte-scroller/Scroller.svelte";
    const get_foreground_slot_changes = dirty => ({});
    const get_foreground_slot_context = ctx => ({});
    const get_background_slot_changes = dirty => ({});
    const get_background_slot_context = ctx => ({});

    function create_fragment$j(ctx) {
    	let svelte_scroller_outer;
    	let svelte_scroller_background_container;
    	let svelte_scroller_background;
    	let t;
    	let svelte_scroller_foreground;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[20]);
    	const background_slot_template = /*#slots*/ ctx[19].background;
    	const background_slot = create_slot(background_slot_template, ctx, /*$$scope*/ ctx[18], get_background_slot_context);
    	const foreground_slot_template = /*#slots*/ ctx[19].foreground;
    	const foreground_slot = create_slot(foreground_slot_template, ctx, /*$$scope*/ ctx[18], get_foreground_slot_context);

    	const block = {
    		c: function create() {
    			svelte_scroller_outer = element("svelte-scroller-outer");
    			svelte_scroller_background_container = element("svelte-scroller-background-container");
    			svelte_scroller_background = element("svelte-scroller-background");
    			if (background_slot) background_slot.c();
    			t = space();
    			svelte_scroller_foreground = element("svelte-scroller-foreground");
    			if (foreground_slot) foreground_slot.c();
    			set_custom_element_data(svelte_scroller_background, "class", "svelte-xdbafy");
    			add_location(svelte_scroller_background, file$g, 169, 2, 3916);
    			set_custom_element_data(svelte_scroller_background_container, "class", "background-container svelte-xdbafy");
    			set_custom_element_data(svelte_scroller_background_container, "style", /*style*/ ctx[4]);
    			add_location(svelte_scroller_background_container, file$g, 168, 1, 3838);
    			set_custom_element_data(svelte_scroller_foreground, "class", "svelte-xdbafy");
    			add_location(svelte_scroller_foreground, file$g, 174, 1, 4078);
    			set_custom_element_data(svelte_scroller_outer, "class", "svelte-xdbafy");
    			add_location(svelte_scroller_outer, file$g, 167, 0, 3795);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svelte_scroller_outer, anchor);
    			append_dev(svelte_scroller_outer, svelte_scroller_background_container);
    			append_dev(svelte_scroller_background_container, svelte_scroller_background);

    			if (background_slot) {
    				background_slot.m(svelte_scroller_background, null);
    			}

    			/*svelte_scroller_background_binding*/ ctx[21](svelte_scroller_background);
    			append_dev(svelte_scroller_outer, t);
    			append_dev(svelte_scroller_outer, svelte_scroller_foreground);

    			if (foreground_slot) {
    				foreground_slot.m(svelte_scroller_foreground, null);
    			}

    			/*svelte_scroller_foreground_binding*/ ctx[22](svelte_scroller_foreground);
    			/*svelte_scroller_outer_binding*/ ctx[23](svelte_scroller_outer);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window_1, "resize", /*onwindowresize*/ ctx[20]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (background_slot) {
    				if (background_slot.p && (!current || dirty[0] & /*$$scope*/ 262144)) {
    					update_slot(background_slot, background_slot_template, ctx, /*$$scope*/ ctx[18], dirty, get_background_slot_changes, get_background_slot_context);
    				}
    			}

    			if (!current || dirty[0] & /*style*/ 16) {
    				set_custom_element_data(svelte_scroller_background_container, "style", /*style*/ ctx[4]);
    			}

    			if (foreground_slot) {
    				if (foreground_slot.p && (!current || dirty[0] & /*$$scope*/ 262144)) {
    					update_slot(foreground_slot, foreground_slot_template, ctx, /*$$scope*/ ctx[18], dirty, get_foreground_slot_changes, get_foreground_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(background_slot, local);
    			transition_in(foreground_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(background_slot, local);
    			transition_out(foreground_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svelte_scroller_outer);
    			if (background_slot) background_slot.d(detaching);
    			/*svelte_scroller_background_binding*/ ctx[21](null);
    			if (foreground_slot) foreground_slot.d(detaching);
    			/*svelte_scroller_foreground_binding*/ ctx[22](null);
    			/*svelte_scroller_outer_binding*/ ctx[23](null);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const handlers = [];
    let manager;

    if (typeof window !== "undefined") {
    	const run_all = () => handlers.forEach(fn => fn());
    	window.addEventListener("scroll", run_all);
    	window.addEventListener("resize", run_all);
    }

    if (typeof IntersectionObserver !== "undefined") {
    	const map = new Map();

    	const observer = new IntersectionObserver((entries, observer) => {
    			entries.forEach(entry => {
    				const update = map.get(entry.target);
    				const index = handlers.indexOf(update);

    				if (entry.isIntersecting) {
    					if (index === -1) handlers.push(update);
    				} else {
    					update();
    					if (index !== -1) handlers.splice(index, 1);
    				}
    			});
    		},
    	{
    			rootMargin: "400px 0px", // TODO why 400?
    			
    		});

    	manager = {
    		add: ({ outer, update }) => {
    			const { top, bottom } = outer.getBoundingClientRect();
    			if (top < window.innerHeight && bottom > 0) handlers.push(update);
    			map.set(outer, update);
    			observer.observe(outer);
    		},
    		remove: ({ outer, update }) => {
    			const index = handlers.indexOf(update);
    			if (index !== -1) handlers.splice(index, 1);
    			map.delete(outer);
    			observer.unobserve(outer);
    		}
    	};
    } else {
    	manager = {
    		add: ({ update }) => {
    			handlers.push(update);
    		},
    		remove: ({ update }) => {
    			const index = handlers.indexOf(update);
    			if (index !== -1) handlers.splice(index, 1);
    		}
    	};
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let top_px;
    	let bottom_px;
    	let threshold_px;
    	let style;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Scroller", slots, ['background','foreground']);
    	let { top = 0 } = $$props;
    	let { bottom = 1 } = $$props;
    	let { threshold = 0.5 } = $$props;
    	let { query = "section" } = $$props;
    	let { parallax = false } = $$props;
    	let { index = 0 } = $$props;
    	let { count = 0 } = $$props;
    	let { offset = 0 } = $$props;
    	let { progress = 0 } = $$props;
    	let { visible = false } = $$props;
    	let outer;
    	let foreground;
    	let background;
    	let left;
    	let sections;
    	let wh = 0;
    	let fixed;
    	let offset_top;
    	let width = 1;
    	let height;
    	let inverted;

    	onMount(() => {
    		sections = foreground.querySelectorAll(query);
    		$$invalidate(6, count = sections.length);
    		update();
    		const scroller = { outer, update };
    		manager.add(scroller);
    		return () => manager.remove(scroller);
    	});

    	function update() {
    		if (!foreground) return;

    		// re-measure outer container
    		const bcr = outer.getBoundingClientRect();

    		left = bcr.left;
    		$$invalidate(17, width = bcr.right - left);

    		// determine fix state
    		const fg = foreground.getBoundingClientRect();

    		const bg = background.getBoundingClientRect();
    		$$invalidate(9, visible = fg.top < wh && fg.bottom > 0);
    		const foreground_height = fg.bottom - fg.top;
    		const background_height = bg.bottom - bg.top;
    		const available_space = bottom_px - top_px;
    		$$invalidate(8, progress = (top_px - fg.top) / (foreground_height - available_space));

    		if (progress <= 0) {
    			$$invalidate(16, offset_top = 0);
    			$$invalidate(15, fixed = false);
    		} else if (progress >= 1) {
    			$$invalidate(16, offset_top = parallax
    			? foreground_height - background_height
    			: foreground_height - available_space);

    			$$invalidate(15, fixed = false);
    		} else {
    			$$invalidate(16, offset_top = parallax
    			? Math.round(top_px - progress * (background_height - available_space))
    			: top_px);

    			$$invalidate(15, fixed = true);
    		}

    		for ($$invalidate(5, index = 0); index < sections.length; $$invalidate(5, index += 1)) {
    			const section = sections[index];
    			const { top } = section.getBoundingClientRect();
    			const next = sections[index + 1];
    			const bottom = next ? next.getBoundingClientRect().top : fg.bottom;
    			$$invalidate(7, offset = (threshold_px - top) / (bottom - top));
    			if (bottom >= threshold_px) break;
    		}
    	}

    	const writable_props = [
    		"top",
    		"bottom",
    		"threshold",
    		"query",
    		"parallax",
    		"index",
    		"count",
    		"offset",
    		"progress",
    		"visible"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Scroller> was created with unknown prop '${key}'`);
    	});

    	function onwindowresize() {
    		$$invalidate(0, wh = window_1.innerHeight);
    	}

    	function svelte_scroller_background_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			background = $$value;
    			$$invalidate(3, background);
    		});
    	}

    	function svelte_scroller_foreground_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			foreground = $$value;
    			$$invalidate(2, foreground);
    		});
    	}

    	function svelte_scroller_outer_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			outer = $$value;
    			$$invalidate(1, outer);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("top" in $$props) $$invalidate(10, top = $$props.top);
    		if ("bottom" in $$props) $$invalidate(11, bottom = $$props.bottom);
    		if ("threshold" in $$props) $$invalidate(12, threshold = $$props.threshold);
    		if ("query" in $$props) $$invalidate(13, query = $$props.query);
    		if ("parallax" in $$props) $$invalidate(14, parallax = $$props.parallax);
    		if ("index" in $$props) $$invalidate(5, index = $$props.index);
    		if ("count" in $$props) $$invalidate(6, count = $$props.count);
    		if ("offset" in $$props) $$invalidate(7, offset = $$props.offset);
    		if ("progress" in $$props) $$invalidate(8, progress = $$props.progress);
    		if ("visible" in $$props) $$invalidate(9, visible = $$props.visible);
    		if ("$$scope" in $$props) $$invalidate(18, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		handlers,
    		manager,
    		onMount,
    		top,
    		bottom,
    		threshold,
    		query,
    		parallax,
    		index,
    		count,
    		offset,
    		progress,
    		visible,
    		outer,
    		foreground,
    		background,
    		left,
    		sections,
    		wh,
    		fixed,
    		offset_top,
    		width,
    		height,
    		inverted,
    		update,
    		top_px,
    		bottom_px,
    		threshold_px,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ("top" in $$props) $$invalidate(10, top = $$props.top);
    		if ("bottom" in $$props) $$invalidate(11, bottom = $$props.bottom);
    		if ("threshold" in $$props) $$invalidate(12, threshold = $$props.threshold);
    		if ("query" in $$props) $$invalidate(13, query = $$props.query);
    		if ("parallax" in $$props) $$invalidate(14, parallax = $$props.parallax);
    		if ("index" in $$props) $$invalidate(5, index = $$props.index);
    		if ("count" in $$props) $$invalidate(6, count = $$props.count);
    		if ("offset" in $$props) $$invalidate(7, offset = $$props.offset);
    		if ("progress" in $$props) $$invalidate(8, progress = $$props.progress);
    		if ("visible" in $$props) $$invalidate(9, visible = $$props.visible);
    		if ("outer" in $$props) $$invalidate(1, outer = $$props.outer);
    		if ("foreground" in $$props) $$invalidate(2, foreground = $$props.foreground);
    		if ("background" in $$props) $$invalidate(3, background = $$props.background);
    		if ("left" in $$props) left = $$props.left;
    		if ("sections" in $$props) sections = $$props.sections;
    		if ("wh" in $$props) $$invalidate(0, wh = $$props.wh);
    		if ("fixed" in $$props) $$invalidate(15, fixed = $$props.fixed);
    		if ("offset_top" in $$props) $$invalidate(16, offset_top = $$props.offset_top);
    		if ("width" in $$props) $$invalidate(17, width = $$props.width);
    		if ("height" in $$props) height = $$props.height;
    		if ("inverted" in $$props) $$invalidate(30, inverted = $$props.inverted);
    		if ("top_px" in $$props) top_px = $$props.top_px;
    		if ("bottom_px" in $$props) bottom_px = $$props.bottom_px;
    		if ("threshold_px" in $$props) threshold_px = $$props.threshold_px;
    		if ("style" in $$props) $$invalidate(4, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*top, wh*/ 1025) {
    			top_px = Math.round(top * wh);
    		}

    		if ($$self.$$.dirty[0] & /*bottom, wh*/ 2049) {
    			bottom_px = Math.round(bottom * wh);
    		}

    		if ($$self.$$.dirty[0] & /*threshold, wh*/ 4097) {
    			threshold_px = Math.round(threshold * wh);
    		}

    		if ($$self.$$.dirty[0] & /*top, bottom, threshold, parallax*/ 23552) {
    			(update());
    		}

    		if ($$self.$$.dirty[0] & /*fixed, offset_top, width*/ 229376) {
    			$$invalidate(4, style = `
		position: ${fixed ? "fixed" : "absolute"};
		top: 0;
		transform: translate(0, ${offset_top}px);
		width: ${width}px;
		z-index: ${inverted ? 3 : 1};
	`);
    		}
    	};

    	return [
    		wh,
    		outer,
    		foreground,
    		background,
    		style,
    		index,
    		count,
    		offset,
    		progress,
    		visible,
    		top,
    		bottom,
    		threshold,
    		query,
    		parallax,
    		fixed,
    		offset_top,
    		width,
    		$$scope,
    		slots,
    		onwindowresize,
    		svelte_scroller_background_binding,
    		svelte_scroller_foreground_binding,
    		svelte_scroller_outer_binding
    	];
    }

    class Scroller extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$j,
    			create_fragment$j,
    			safe_not_equal,
    			{
    				top: 10,
    				bottom: 11,
    				threshold: 12,
    				query: 13,
    				parallax: 14,
    				index: 5,
    				count: 6,
    				offset: 7,
    				progress: 8,
    				visible: 9
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Scroller",
    			options,
    			id: create_fragment$j.name
    		});
    	}

    	get top() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set top(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bottom() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bottom(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get threshold() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set threshold(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get query() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set query(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get parallax() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set parallax(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get count() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set count(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offset() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offset(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get progress() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set progress(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get visible() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/multimedia/Photo.svelte generated by Svelte v3.38.2 */

    const file$f = "src/components/multimedia/Photo.svelte";

    function create_fragment$i(ctx) {
    	let img;
    	let img_class_value;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", img_class_value = "" + (null_to_empty(/*layout*/ ctx[2]) + " svelte-mczv6o"));
    			if (img.src !== (img_src_value = "img/" + /*src*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", /*alt*/ ctx[1]);
    			add_location(img, file$f, 6, 0, 77);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*layout*/ 4 && img_class_value !== (img_class_value = "" + (null_to_empty(/*layout*/ ctx[2]) + " svelte-mczv6o"))) {
    				attr_dev(img, "class", img_class_value);
    			}

    			if (dirty & /*src*/ 1 && img.src !== (img_src_value = "img/" + /*src*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*alt*/ 2) {
    				attr_dev(img, "alt", /*alt*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Photo", slots, []);
    	let { src } = $$props;
    	let { alt } = $$props;
    	let { layout } = $$props;
    	const writable_props = ["src", "alt", "layout"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Photo> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    		if ("alt" in $$props) $$invalidate(1, alt = $$props.alt);
    		if ("layout" in $$props) $$invalidate(2, layout = $$props.layout);
    	};

    	$$self.$capture_state = () => ({ src, alt, layout });

    	$$self.$inject_state = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    		if ("alt" in $$props) $$invalidate(1, alt = $$props.alt);
    		if ("layout" in $$props) $$invalidate(2, layout = $$props.layout);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [src, alt, layout];
    }

    class Photo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, { src: 0, alt: 1, layout: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Photo",
    			options,
    			id: create_fragment$i.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*src*/ ctx[0] === undefined && !("src" in props)) {
    			console.warn("<Photo> was created without expected prop 'src'");
    		}

    		if (/*alt*/ ctx[1] === undefined && !("alt" in props)) {
    			console.warn("<Photo> was created without expected prop 'alt'");
    		}

    		if (/*layout*/ ctx[2] === undefined && !("layout" in props)) {
    			console.warn("<Photo> was created without expected prop 'layout'");
    		}
    	}

    	get src() {
    		throw new Error("<Photo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<Photo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get alt() {
    		throw new Error("<Photo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set alt(value) {
    		throw new Error("<Photo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get layout() {
    		throw new Error("<Photo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set layout(value) {
    		throw new Error("<Photo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/multimedia/Intro.svelte generated by Svelte v3.38.2 */

    const { console: console_1 } = globals;
    const file$e = "src/components/multimedia/Intro.svelte";

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	child_ctx[26] = i;
    	return child_ctx;
    }

    // (56:2) 
    function create_background_slot$2(ctx) {
    	let div2;
    	let div0;
    	let photo;
    	let t;
    	let div1;
    	let video_1;
    	let video_1_class_value;
    	let video_1_poster_value;
    	let video_1_src_value;
    	let video_1_updating = false;
    	let video_1_animationframe;
    	let current;
    	let mounted;
    	let dispose;

    	photo = new Photo({
    			props: { src: /*poster*/ ctx[9], layout: layout$3 },
    			$$inline: true
    		});

    	function video_1_timeupdate_handler() {
    		cancelAnimationFrame(video_1_animationframe);

    		if (!video_1.paused) {
    			video_1_animationframe = raf(video_1_timeupdate_handler);
    			video_1_updating = true;
    		}

    		/*video_1_timeupdate_handler*/ ctx[16].call(video_1);
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			create_component(photo.$$.fragment);
    			t = space();
    			div1 = element("div");
    			video_1 = element("video");
    			attr_dev(div0, "class", "full absolute svelte-1fiu7ba");
    			add_location(div0, file$e, 56, 6, 1172);
    			attr_dev(video_1, "class", video_1_class_value = "" + (layout$3 + " " + /*fade*/ ctx[7] + " svelte-1fiu7ba"));
    			attr_dev(video_1, "preload", "auto");
    			attr_dev(video_1, "poster", video_1_poster_value = "img/" + /*src*/ ctx[8] + ".jpg");
    			if (video_1.src !== (video_1_src_value = "video/" + /*src*/ ctx[8] + "_" + /*vidSize*/ ctx[10] + ".mp4")) attr_dev(video_1, "src", video_1_src_value);
    			video_1.muted = /*muted*/ ctx[11];
    			video_1.autoplay = "true";
    			video_1.playsInline = "true";
    			video_1.loop = "true";
    			video_1.controls = false;
    			if (/*duration*/ ctx[5] === void 0) add_render_callback(() => /*video_1_durationchange_handler*/ ctx[17].call(video_1));
    			add_location(video_1, file$e, 70, 8, 1494);
    			attr_dev(div1, "class", "full absolute svelte-1fiu7ba");
    			add_location(div1, file$e, 62, 6, 1291);
    			attr_dev(div2, "class", "chapter interactive svelte-1fiu7ba");
    			attr_dev(div2, "slot", "background");
    			add_location(div2, file$e, 55, 2, 1114);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			mount_component(photo, div0, null);
    			append_dev(div2, t);
    			append_dev(div2, div1);
    			append_dev(div1, video_1);
    			/*video_1_binding*/ ctx[18](video_1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(video_1, "timeupdate", video_1_timeupdate_handler),
    					listen_dev(video_1, "durationchange", /*video_1_durationchange_handler*/ ctx[17])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const photo_changes = {};
    			if (dirty & /*poster*/ 512) photo_changes.src = /*poster*/ ctx[9];
    			photo.$set(photo_changes);

    			if (!current || dirty & /*fade*/ 128 && video_1_class_value !== (video_1_class_value = "" + (layout$3 + " " + /*fade*/ ctx[7] + " svelte-1fiu7ba"))) {
    				attr_dev(video_1, "class", video_1_class_value);
    			}

    			if (!current || dirty & /*src*/ 256 && video_1_poster_value !== (video_1_poster_value = "img/" + /*src*/ ctx[8] + ".jpg")) {
    				attr_dev(video_1, "poster", video_1_poster_value);
    			}

    			if (!current || dirty & /*src, vidSize*/ 1280 && video_1.src !== (video_1_src_value = "video/" + /*src*/ ctx[8] + "_" + /*vidSize*/ ctx[10] + ".mp4")) {
    				attr_dev(video_1, "src", video_1_src_value);
    			}

    			if (!current || dirty & /*muted*/ 2048) {
    				prop_dev(video_1, "muted", /*muted*/ ctx[11]);
    			}

    			if (!video_1_updating && dirty & /*time*/ 16 && !isNaN(/*time*/ ctx[4])) {
    				video_1.currentTime = /*time*/ ctx[4];
    			}

    			video_1_updating = false;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(photo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(photo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(photo);
    			/*video_1_binding*/ ctx[18](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_background_slot$2.name,
    		type: "slot",
    		source: "(56:2) ",
    		ctx
    	});

    	return block;
    }

    // (94:6) {:else}
    function create_else_block$2(ctx) {
    	let section;
    	let div;
    	let t;
    	let section_class_value;

    	function select_block_type_1(ctx, dirty) {
    		if (/*i*/ ctx[26] % 2 === 0 || /*i*/ ctx[26] > 5) return create_if_block_1$2;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			if_block.c();
    			t = space();
    			attr_dev(div, "class", "annotation svelte-1fiu7ba");
    			add_location(div, file$e, 95, 8, 2224);
    			attr_dev(section, "class", section_class_value = "" + ((/*play*/ ctx[3] ? "not-interactive" : "interactive") + " col-text" + " svelte-1fiu7ba"));
    			add_location(section, file$e, 94, 6, 2146);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);
    			if_block.m(div, null);
    			append_dev(section, t);
    		},
    		p: function update(ctx, dirty) {
    			if_block.p(ctx, dirty);

    			if (dirty & /*play*/ 8 && section_class_value !== (section_class_value = "" + ((/*play*/ ctx[3] ? "not-interactive" : "interactive") + " col-text" + " svelte-1fiu7ba"))) {
    				attr_dev(section, "class", section_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(94:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (90:4) {#if p.p === 'Infància (des)protegida'}
    function create_if_block$7(ctx) {
    	let section;
    	let h1;
    	let raw_value = /*boldFirst*/ ctx[12](/*p*/ ctx[24].p) + "";
    	let t;

    	const block = {
    		c: function create() {
    			section = element("section");
    			h1 = element("h1");
    			t = space();
    			attr_dev(h1, "class", "svelte-1fiu7ba");
    			add_location(h1, file$e, 91, 8, 2077);
    			attr_dev(section, "class", "full title svelte-1fiu7ba");
    			add_location(section, file$e, 90, 6, 2040);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h1);
    			h1.innerHTML = raw_value;
    			append_dev(section, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*parts*/ 1 && raw_value !== (raw_value = /*boldFirst*/ ctx[12](/*p*/ ctx[24].p) + "")) h1.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(90:4) {#if p.p === 'Infància (des)protegida'}",
    		ctx
    	});

    	return block;
    }

    // (99:10) {:else}
    function create_else_block_1(ctx) {
    	let p;
    	let html_tag;
    	let raw_value = /*p*/ ctx[24].p + "";
    	let t;
    	let mounted;
    	let dispose;
    	let if_block = /*index*/ ctx[1] % 2 && create_if_block_2$1(ctx);

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = space();
    			if (if_block) if_block.c();
    			html_tag = new HtmlTag(t);
    			attr_dev(p, "class", "intro svelte-1fiu7ba");
    			add_location(p, file$e, 99, 10, 2355);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			html_tag.m(raw_value, p);
    			append_dev(p, t);
    			if (if_block) if_block.m(p, null);

    			if (!mounted) {
    				dispose = listen_dev(p, "click", /*click_handler*/ ctx[15], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*parts*/ 1 && raw_value !== (raw_value = /*p*/ ctx[24].p + "")) html_tag.p(raw_value);

    			if (/*index*/ ctx[1] % 2) {
    				if (if_block) ; else {
    					if_block = create_if_block_2$1(ctx);
    					if_block.c();
    					if_block.m(p, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(99:10) {:else}",
    		ctx
    	});

    	return block;
    }

    // (97:10) {#if i%2 === 0 || i > 5}
    function create_if_block_1$2(ctx) {
    	let p;
    	let raw_value = /*p*/ ctx[24].p + "";

    	const block = {
    		c: function create() {
    			p = element("p");
    			attr_dev(p, "class", "intro svelte-1fiu7ba");
    			add_location(p, file$e, 97, 10, 2294);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			p.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*parts*/ 1 && raw_value !== (raw_value = /*p*/ ctx[24].p + "")) p.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(97:10) {#if i%2 === 0 || i > 5}",
    		ctx
    	});

    	return block;
    }

    // (101:12) {#if index % 2}
    function create_if_block_2$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "sound svelte-1fiu7ba");
    			add_location(div, file$e, 101, 12, 2456);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(101:12) {#if index % 2}",
    		ctx
    	});

    	return block;
    }

    // (89:4) {#each parts as p,i}
    function create_each_block$8(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*p*/ ctx[24].p === "Infància (des)protegida") return create_if_block$7;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$8.name,
    		type: "each",
    		source: "(89:4) {#each parts as p,i}",
    		ctx
    	});

    	return block;
    }

    // (88:2) 
    function create_foreground_slot$2(ctx) {
    	let div;
    	let div_class_value;
    	let each_value = /*parts*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$8(get_each_context$8(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*play*/ ctx[3] ? "not-interactive" : "interactive") + " svelte-1fiu7ba"));
    			attr_dev(div, "slot", "foreground");
    			add_location(div, file$e, 87, 2, 1892);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*boldFirst, parts, play, handlePlay, index*/ 12299) {
    				each_value = /*parts*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$8(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$8(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*play*/ 8 && div_class_value !== (div_class_value = "" + (null_to_empty(/*play*/ ctx[3] ? "not-interactive" : "interactive") + " svelte-1fiu7ba"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_foreground_slot$2.name,
    		type: "slot",
    		source: "(88:2) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let scroller;
    	let updating_index;
    	let updating_offset;
    	let current;

    	function scroller_index_binding(value) {
    		/*scroller_index_binding*/ ctx[19](value);
    	}

    	function scroller_offset_binding(value) {
    		/*scroller_offset_binding*/ ctx[20](value);
    	}

    	let scroller_props = {
    		threshold: ".3",
    		$$slots: {
    			foreground: [create_foreground_slot$2],
    			background: [create_background_slot$2]
    		},
    		$$scope: { ctx }
    	};

    	if (/*index*/ ctx[1] !== void 0) {
    		scroller_props.index = /*index*/ ctx[1];
    	}

    	if (/*offset*/ ctx[2] !== void 0) {
    		scroller_props.offset = /*offset*/ ctx[2];
    	}

    	scroller = new Scroller({ props: scroller_props, $$inline: true });
    	binding_callbacks.push(() => bind(scroller, "index", scroller_index_binding));
    	binding_callbacks.push(() => bind(scroller, "offset", scroller_offset_binding));

    	const block = {
    		c: function create() {
    			create_component(scroller.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(scroller, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const scroller_changes = {};

    			if (dirty & /*$$scope, play, parts, index, fade, src, vidSize, muted, time, duration, video, poster*/ 134221819) {
    				scroller_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_index && dirty & /*index*/ 2) {
    				updating_index = true;
    				scroller_changes.index = /*index*/ ctx[1];
    				add_flush_callback(() => updating_index = false);
    			}

    			if (!updating_offset && dirty & /*offset*/ 4) {
    				updating_offset = true;
    				scroller_changes.offset = /*offset*/ ctx[2];
    				add_flush_callback(() => updating_offset = false);
    			}

    			scroller.$set(scroller_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(scroller.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(scroller.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(scroller, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const layout$3 = "cover absolute";

    function instance$h($$self, $$props, $$invalidate) {
    	let fade;
    	let active;
    	let src;
    	let poster;
    	let vidSize;
    	let muted;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Intro", slots, []);
    	let { parts } = $$props;
    	let index = 0;
    	let offset, time, duration, video;
    	let audible = true;

    	const boldFirst = text => {
    		const [first, ...rest] = text.split(" ");
    		return `<strong>${first}</strong> ${rest.join(" ")}`;
    	};

    	let width, play = false;

    	const handlePlay = () => {
    		$$invalidate(3, play = !play);

    		if (play) {
    			$$invalidate(4, time = 0);
    			$$invalidate(6, video.muted = false, video);
    			$$invalidate(6, video.loop = false, video);
    		}
    	};

    	const toggle = () => {
    		console.log("hola!");
    	};

    	const writable_props = ["parts"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Intro> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => handlePlay();

    	function video_1_timeupdate_handler() {
    		time = this.currentTime;
    		$$invalidate(4, time);
    	}

    	function video_1_durationchange_handler() {
    		duration = this.duration;
    		$$invalidate(5, duration);
    	}

    	function video_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			video = $$value;
    			$$invalidate(6, video);
    		});
    	}

    	function scroller_index_binding(value) {
    		index = value;
    		$$invalidate(1, index);
    	}

    	function scroller_offset_binding(value) {
    		offset = value;
    		$$invalidate(2, offset);
    	}

    	$$self.$$set = $$props => {
    		if ("parts" in $$props) $$invalidate(0, parts = $$props.parts);
    	};

    	$$self.$capture_state = () => ({
    		Scroller,
    		Photo,
    		parts,
    		index,
    		offset,
    		time,
    		duration,
    		video,
    		layout: layout$3,
    		audible,
    		boldFirst,
    		width,
    		play,
    		handlePlay,
    		toggle,
    		fade,
    		active,
    		src,
    		poster,
    		vidSize,
    		muted
    	});

    	$$self.$inject_state = $$props => {
    		if ("parts" in $$props) $$invalidate(0, parts = $$props.parts);
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    		if ("offset" in $$props) $$invalidate(2, offset = $$props.offset);
    		if ("time" in $$props) $$invalidate(4, time = $$props.time);
    		if ("duration" in $$props) $$invalidate(5, duration = $$props.duration);
    		if ("video" in $$props) $$invalidate(6, video = $$props.video);
    		if ("audible" in $$props) audible = $$props.audible;
    		if ("width" in $$props) $$invalidate(22, width = $$props.width);
    		if ("play" in $$props) $$invalidate(3, play = $$props.play);
    		if ("fade" in $$props) $$invalidate(7, fade = $$props.fade);
    		if ("active" in $$props) $$invalidate(14, active = $$props.active);
    		if ("src" in $$props) $$invalidate(8, src = $$props.src);
    		if ("poster" in $$props) $$invalidate(9, poster = $$props.poster);
    		if ("vidSize" in $$props) $$invalidate(10, vidSize = $$props.vidSize);
    		if ("muted" in $$props) $$invalidate(11, muted = $$props.muted);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*index, offset*/ 6) {
    			$$invalidate(7, fade = index % 2 && offset < 0.1
    			? "in"
    			: index % 2 && offset > 0.9 ? "out" : "");
    		}

    		if ($$self.$$.dirty & /*index*/ 2) {
    			$$invalidate(14, active = index % 2 && index < 6);
    		}

    		if ($$self.$$.dirty & /*index, parts*/ 3) {
    			$$invalidate(8, src = index < parts.length - 2
    			? parts[index].video
    			: parts[parts.length - 1].video);
    		}

    		if ($$self.$$.dirty & /*index, parts*/ 3) {
    			$$invalidate(9, poster = index < parts.length - 2
    			? parts[index].poster
    			: parts[parts.length - 1].poster);
    		}

    		if ($$self.$$.dirty & /*active, play*/ 16392) {
    			$$invalidate(11, muted = active && play ? false : "muted");
    		}
    	};

    	$$invalidate(10, vidSize = width < 854
    	? "s"
    	: width < 1280 ? "m" : width < 1920 ? "l" : "xl");

    	return [
    		parts,
    		index,
    		offset,
    		play,
    		time,
    		duration,
    		video,
    		fade,
    		src,
    		poster,
    		vidSize,
    		muted,
    		boldFirst,
    		handlePlay,
    		active,
    		click_handler,
    		video_1_timeupdate_handler,
    		video_1_durationchange_handler,
    		video_1_binding,
    		scroller_index_binding,
    		scroller_offset_binding
    	];
    }

    class Intro extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { parts: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Intro",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*parts*/ ctx[0] === undefined && !("parts" in props)) {
    			console_1.warn("<Intro> was created without expected prop 'parts'");
    		}
    	}

    	get parts() {
    		throw new Error("<Intro>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set parts(value) {
    		throw new Error("<Intro>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/text/Text.svelte generated by Svelte v3.38.2 */

    const file$d = "src/components/text/Text.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (8:2) {#if header}
    function create_if_block_2(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			add_location(h3, file$d, 8, 2, 139);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			h3.innerHTML = /*header*/ ctx[2];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*header*/ 4) h3.innerHTML = /*header*/ ctx[2];		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(8:2) {#if header}",
    		ctx
    	});

    	return block;
    }

    // (12:2) {#if text}
    function create_if_block_1$1(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*text*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*dropcap, text*/ 9) {
    				each_value_1 = /*text*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(12:2) {#if text}",
    		ctx
    	});

    	return block;
    }

    // (13:2) {#each text as p,i}
    function create_each_block_1$1(ctx) {
    	let p;
    	let raw_value = /*p*/ ctx[7].p + "";
    	let p_class_value;

    	const block = {
    		c: function create() {
    			p = element("p");

    			attr_dev(p, "class", p_class_value = "" + (null_to_empty(/*i*/ ctx[9] === 0 && /*dropcap*/ ctx[3] === true
    			? "has-dropcap"
    			: "") + " svelte-14ek18h"));

    			add_location(p, file$d, 13, 6, 213);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			p.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text*/ 1 && raw_value !== (raw_value = /*p*/ ctx[7].p + "")) p.innerHTML = raw_value;
    			if (dirty & /*dropcap*/ 8 && p_class_value !== (p_class_value = "" + (null_to_empty(/*i*/ ctx[9] === 0 && /*dropcap*/ ctx[3] === true
    			? "has-dropcap"
    			: "") + " svelte-14ek18h"))) {
    				attr_dev(p, "class", p_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(13:2) {#each text as p,i}",
    		ctx
    	});

    	return block;
    }

    // (18:2) {#if list}
    function create_if_block$6(ctx) {
    	let ul;
    	let each_value = /*list*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(ul, file$d, 18, 4, 327);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*list*/ 2) {
    				each_value = /*list*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$7(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$7(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(18:2) {#if list}",
    		ctx
    	});

    	return block;
    }

    // (20:6) {#each list as li}
    function create_each_block$7(ctx) {
    	let li;
    	let raw_value = /*li*/ ctx[4] + "";

    	const block = {
    		c: function create() {
    			li = element("li");
    			add_location(li, file$d, 20, 6, 363);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			li.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*list*/ 2 && raw_value !== (raw_value = /*li*/ ctx[4] + "")) li.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(20:6) {#each list as li}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let if_block0 = /*header*/ ctx[2] && create_if_block_2(ctx);
    	let if_block1 = /*text*/ ctx[0] && create_if_block_1$1(ctx);
    	let if_block2 = /*list*/ ctx[1] && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(div, "class", "col-text");
    			add_location(div, file$d, 6, 0, 99);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(div, t1);
    			if (if_block2) if_block2.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*header*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*text*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					if_block1.m(div, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*list*/ ctx[1]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$6(ctx);
    					if_block2.c();
    					if_block2.m(div, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Text", slots, []);
    	let { text } = $$props;
    	let { list } = $$props;
    	let { header } = $$props;
    	let { dropcap = true } = $$props;
    	const writable_props = ["text", "list", "header", "dropcap"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Text> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("list" in $$props) $$invalidate(1, list = $$props.list);
    		if ("header" in $$props) $$invalidate(2, header = $$props.header);
    		if ("dropcap" in $$props) $$invalidate(3, dropcap = $$props.dropcap);
    	};

    	$$self.$capture_state = () => ({ text, list, header, dropcap });

    	$$self.$inject_state = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("list" in $$props) $$invalidate(1, list = $$props.list);
    		if ("header" in $$props) $$invalidate(2, header = $$props.header);
    		if ("dropcap" in $$props) $$invalidate(3, dropcap = $$props.dropcap);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text, list, header, dropcap];
    }

    class Text extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { text: 0, list: 1, header: 2, dropcap: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Text",
    			options,
    			id: create_fragment$g.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*text*/ ctx[0] === undefined && !("text" in props)) {
    			console.warn("<Text> was created without expected prop 'text'");
    		}

    		if (/*list*/ ctx[1] === undefined && !("list" in props)) {
    			console.warn("<Text> was created without expected prop 'list'");
    		}

    		if (/*header*/ ctx[2] === undefined && !("header" in props)) {
    			console.warn("<Text> was created without expected prop 'header'");
    		}
    	}

    	get text() {
    		throw new Error("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get list() {
    		throw new Error("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set list(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get header() {
    		throw new Error("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set header(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dropcap() {
    		throw new Error("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dropcap(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function fade(node, { delay = 0, duration = 400, easing = identity$3 } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* src/components/multimedia/Video.svelte generated by Svelte v3.38.2 */
    const file$c = "src/components/multimedia/Video.svelte";

    // (58:2) {#if captions}
    function create_if_block_1(ctx) {
    	let track;
    	let track_src_value;

    	const block = {
    		c: function create() {
    			track = element("track");
    			attr_dev(track, "kind", "captions");
    			attr_dev(track, "label", "Catalan");
    			attr_dev(track, "srclang", "ca");
    			if (track.src !== (track_src_value = /*captions*/ ctx[5])) attr_dev(track, "src", track_src_value);
    			track.default = true;
    			add_location(track, file$c, 58, 2, 1088);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, track, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*captions*/ 32 && track.src !== (track_src_value = /*captions*/ ctx[5])) {
    				attr_dev(track, "src", track_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(track);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(58:2) {#if captions}",
    		ctx
    	});

    	return block;
    }

    // (63:0) {#if !play && audible}
    function create_if_block$5(ctx) {
    	let div;
    	let div_transition;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "sound svelte-pfmeda");
    			add_location(div, file$c, 63, 0, 1205);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[19], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, fade, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(63:0) {#if !play && audible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let div;
    	let video_1;
    	let video_1_poster_value;
    	let video_1_src_value;
    	let video_1_muted_value;
    	let video_1_controls_value;
    	let video_1_updating = false;
    	let video_1_animationframe;
    	let t;
    	let div_class_value;
    	let div_resize_listener;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*captions*/ ctx[5] && create_if_block_1(ctx);

    	function video_1_timeupdate_handler() {
    		cancelAnimationFrame(video_1_animationframe);

    		if (!video_1.paused) {
    			video_1_animationframe = raf(video_1_timeupdate_handler);
    			video_1_updating = true;
    		}

    		/*video_1_timeupdate_handler*/ ctx[16].call(video_1);
    	}

    	let if_block1 = !/*play*/ ctx[10] && /*audible*/ ctx[3] && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			video_1 = element("video");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr_dev(video_1, "preload", "auto");
    			attr_dev(video_1, "poster", video_1_poster_value = "img/" + /*src*/ ctx[4] + ".jpg");
    			if (video_1.src !== (video_1_src_value = "video/" + /*src*/ ctx[4] + "_" + /*vidSize*/ ctx[11] + ".mp4")) attr_dev(video_1, "src", video_1_src_value);
    			video_1.muted = video_1_muted_value = /*active*/ ctx[6] && /*play*/ ctx[10] ? false : "muted";
    			video_1.autoplay = "true";
    			video_1.playsInline = "true";
    			video_1.loop = "true";

    			video_1.controls = video_1_controls_value = /*audible*/ ctx[3] && /*play*/ ctx[10]
    			? /*controls*/ ctx[8]
    			: false;

    			if (/*duration*/ ctx[2] === void 0) add_render_callback(() => /*video_1_durationchange_handler*/ ctx[17].call(video_1));
    			add_location(video_1, file$c, 44, 0, 778);
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*layout*/ ctx[7]) + " svelte-pfmeda"));
    			add_render_callback(() => /*div_elementresize_handler*/ ctx[20].call(div));
    			add_location(div, file$c, 43, 0, 732);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, video_1);
    			if (if_block0) if_block0.m(video_1, null);
    			/*video_1_binding*/ ctx[18](video_1);
    			append_dev(div, t);
    			if (if_block1) if_block1.m(div, null);
    			div_resize_listener = add_resize_listener(div, /*div_elementresize_handler*/ ctx[20].bind(div));
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(video_1, "timeupdate", video_1_timeupdate_handler),
    					listen_dev(video_1, "durationchange", /*video_1_durationchange_handler*/ ctx[17])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*captions*/ ctx[5]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(video_1, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!current || dirty & /*src*/ 16 && video_1_poster_value !== (video_1_poster_value = "img/" + /*src*/ ctx[4] + ".jpg")) {
    				attr_dev(video_1, "poster", video_1_poster_value);
    			}

    			if (!current || dirty & /*src, vidSize*/ 2064 && video_1.src !== (video_1_src_value = "video/" + /*src*/ ctx[4] + "_" + /*vidSize*/ ctx[11] + ".mp4")) {
    				attr_dev(video_1, "src", video_1_src_value);
    			}

    			if (!current || dirty & /*active, play*/ 1088 && video_1_muted_value !== (video_1_muted_value = /*active*/ ctx[6] && /*play*/ ctx[10] ? false : "muted")) {
    				prop_dev(video_1, "muted", video_1_muted_value);
    			}

    			if (!current || dirty & /*audible, play, controls*/ 1288 && video_1_controls_value !== (video_1_controls_value = /*audible*/ ctx[3] && /*play*/ ctx[10]
    			? /*controls*/ ctx[8]
    			: false)) {
    				prop_dev(video_1, "controls", video_1_controls_value);
    			}

    			if (!video_1_updating && dirty & /*time*/ 2 && !isNaN(/*time*/ ctx[1])) {
    				video_1.currentTime = /*time*/ ctx[1];
    			}

    			video_1_updating = false;

    			if (!/*play*/ ctx[10] && /*audible*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*play, audible*/ 1032) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$5(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*layout*/ 128 && div_class_value !== (div_class_value = "" + (null_to_empty(/*layout*/ ctx[7]) + " svelte-pfmeda"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			/*video_1_binding*/ ctx[18](null);
    			if (if_block1) if_block1.d();
    			div_resize_listener();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let vidSize;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Video", slots, []);
    	let { audible } = $$props;
    	let { src } = $$props;
    	let { video } = $$props;
    	let { captions } = $$props;
    	let { time } = $$props;
    	let { active } = $$props;
    	let { duration } = $$props;
    	let { layout } = $$props;
    	let { controls = "controls" } = $$props;
    	let { index } = $$props;
    	let { id } = $$props;
    	let { paused } = $$props;
    	let width, play = false;

    	const handlePlay = () => {
    		$$invalidate(1, time = 0);
    		$$invalidate(10, play = true);
    		$$invalidate(13, index = id);
    		$$invalidate(0, video.muted = false, video);
    		$$invalidate(0, video.loop = false, video);
    	};

    	const writable_props = [
    		"audible",
    		"src",
    		"video",
    		"captions",
    		"time",
    		"active",
    		"duration",
    		"layout",
    		"controls",
    		"index",
    		"id",
    		"paused"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Video> was created with unknown prop '${key}'`);
    	});

    	function video_1_timeupdate_handler() {
    		time = this.currentTime;
    		$$invalidate(1, time);
    	}

    	function video_1_durationchange_handler() {
    		duration = this.duration;
    		$$invalidate(2, duration);
    	}

    	function video_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			video = $$value;
    			($$invalidate(0, video), $$invalidate(15, paused));
    		});
    	}

    	const click_handler = () => handlePlay();

    	function div_elementresize_handler() {
    		width = this.clientWidth;
    		$$invalidate(9, width);
    	}

    	$$self.$$set = $$props => {
    		if ("audible" in $$props) $$invalidate(3, audible = $$props.audible);
    		if ("src" in $$props) $$invalidate(4, src = $$props.src);
    		if ("video" in $$props) $$invalidate(0, video = $$props.video);
    		if ("captions" in $$props) $$invalidate(5, captions = $$props.captions);
    		if ("time" in $$props) $$invalidate(1, time = $$props.time);
    		if ("active" in $$props) $$invalidate(6, active = $$props.active);
    		if ("duration" in $$props) $$invalidate(2, duration = $$props.duration);
    		if ("layout" in $$props) $$invalidate(7, layout = $$props.layout);
    		if ("controls" in $$props) $$invalidate(8, controls = $$props.controls);
    		if ("index" in $$props) $$invalidate(13, index = $$props.index);
    		if ("id" in $$props) $$invalidate(14, id = $$props.id);
    		if ("paused" in $$props) $$invalidate(15, paused = $$props.paused);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		audible,
    		src,
    		video,
    		captions,
    		time,
    		active,
    		duration,
    		layout,
    		controls,
    		index,
    		id,
    		paused,
    		width,
    		play,
    		handlePlay,
    		vidSize
    	});

    	$$self.$inject_state = $$props => {
    		if ("audible" in $$props) $$invalidate(3, audible = $$props.audible);
    		if ("src" in $$props) $$invalidate(4, src = $$props.src);
    		if ("video" in $$props) $$invalidate(0, video = $$props.video);
    		if ("captions" in $$props) $$invalidate(5, captions = $$props.captions);
    		if ("time" in $$props) $$invalidate(1, time = $$props.time);
    		if ("active" in $$props) $$invalidate(6, active = $$props.active);
    		if ("duration" in $$props) $$invalidate(2, duration = $$props.duration);
    		if ("layout" in $$props) $$invalidate(7, layout = $$props.layout);
    		if ("controls" in $$props) $$invalidate(8, controls = $$props.controls);
    		if ("index" in $$props) $$invalidate(13, index = $$props.index);
    		if ("id" in $$props) $$invalidate(14, id = $$props.id);
    		if ("paused" in $$props) $$invalidate(15, paused = $$props.paused);
    		if ("width" in $$props) $$invalidate(9, width = $$props.width);
    		if ("play" in $$props) $$invalidate(10, play = $$props.play);
    		if ("vidSize" in $$props) $$invalidate(11, vidSize = $$props.vidSize);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*width*/ 512) {
    			$$invalidate(11, vidSize = width < 854
    			? "s"
    			: width < 1280 ? "m" : width < 1920 ? "l" : "xl");
    		}

    		if ($$self.$$.dirty & /*paused, video*/ 32769) {
    			if (paused) {
    				$$invalidate(10, play = false);

    				if (video) {
    					video.pause();
    					$$invalidate(0, video.muted = true, video);
    					$$invalidate(0, video.loop = true, video);
    				}
    			}
    		}
    	};

    	return [
    		video,
    		time,
    		duration,
    		audible,
    		src,
    		captions,
    		active,
    		layout,
    		controls,
    		width,
    		play,
    		vidSize,
    		handlePlay,
    		index,
    		id,
    		paused,
    		video_1_timeupdate_handler,
    		video_1_durationchange_handler,
    		video_1_binding,
    		click_handler,
    		div_elementresize_handler
    	];
    }

    class Video extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			audible: 3,
    			src: 4,
    			video: 0,
    			captions: 5,
    			time: 1,
    			active: 6,
    			duration: 2,
    			layout: 7,
    			controls: 8,
    			index: 13,
    			id: 14,
    			paused: 15
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Video",
    			options,
    			id: create_fragment$f.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*audible*/ ctx[3] === undefined && !("audible" in props)) {
    			console.warn("<Video> was created without expected prop 'audible'");
    		}

    		if (/*src*/ ctx[4] === undefined && !("src" in props)) {
    			console.warn("<Video> was created without expected prop 'src'");
    		}

    		if (/*video*/ ctx[0] === undefined && !("video" in props)) {
    			console.warn("<Video> was created without expected prop 'video'");
    		}

    		if (/*captions*/ ctx[5] === undefined && !("captions" in props)) {
    			console.warn("<Video> was created without expected prop 'captions'");
    		}

    		if (/*time*/ ctx[1] === undefined && !("time" in props)) {
    			console.warn("<Video> was created without expected prop 'time'");
    		}

    		if (/*active*/ ctx[6] === undefined && !("active" in props)) {
    			console.warn("<Video> was created without expected prop 'active'");
    		}

    		if (/*duration*/ ctx[2] === undefined && !("duration" in props)) {
    			console.warn("<Video> was created without expected prop 'duration'");
    		}

    		if (/*layout*/ ctx[7] === undefined && !("layout" in props)) {
    			console.warn("<Video> was created without expected prop 'layout'");
    		}

    		if (/*index*/ ctx[13] === undefined && !("index" in props)) {
    			console.warn("<Video> was created without expected prop 'index'");
    		}

    		if (/*id*/ ctx[14] === undefined && !("id" in props)) {
    			console.warn("<Video> was created without expected prop 'id'");
    		}

    		if (/*paused*/ ctx[15] === undefined && !("paused" in props)) {
    			console.warn("<Video> was created without expected prop 'paused'");
    		}
    	}

    	get audible() {
    		throw new Error("<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set audible(value) {
    		throw new Error("<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get src() {
    		throw new Error("<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get video() {
    		throw new Error("<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set video(value) {
    		throw new Error("<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get captions() {
    		throw new Error("<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set captions(value) {
    		throw new Error("<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get time() {
    		throw new Error("<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set time(value) {
    		throw new Error("<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duration() {
    		throw new Error("<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get layout() {
    		throw new Error("<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set layout(value) {
    		throw new Error("<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get controls() {
    		throw new Error("<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set controls(value) {
    		throw new Error("<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get paused() {
    		throw new Error("<Video>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set paused(value) {
    		throw new Error("<Video>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/text/Chapter.svelte generated by Svelte v3.38.2 */
    const file$b = "src/components/text/Chapter.svelte";

    // (18:8) {#if id !== 'ara'}
    function create_if_block$4(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "full svelte-15gqpwt");
    			if (img.src !== (img_src_value = "img/" + /*src*/ ctx[0] + ".gif")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$b, 17, 26, 482);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*src*/ 1 && img.src !== (img_src_value = "img/" + /*src*/ ctx[0] + ".gif")) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(18:8) {#if id !== 'ara'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let div1;
    	let section;
    	let t;
    	let div0;
    	let h2;
    	let section_class_value;
    	let div1_class_value;
    	let if_block = /*id*/ ctx[1] !== "ara" && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			section = element("section");
    			if (if_block) if_block.c();
    			t = space();
    			div0 = element("div");
    			h2 = element("h2");
    			attr_dev(h2, "class", "col-text");
    			add_location(h2, file$b, 18, 36, 571);
    			attr_dev(div0, "class", "header-wrapper svelte-15gqpwt");
    			add_location(div0, file$b, 18, 8, 543);
    			attr_dev(section, "class", section_class_value = "full chapter " + (/*id*/ ctx[1] !== "ara" ? "" : "short") + " svelte-15gqpwt");
    			attr_dev(section, "id", /*id*/ ctx[1]);
    			add_location(section, file$b, 16, 4, 370);
    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty(/*id*/ ctx[1] !== "ara" ? "chapter-wrapper" : "short") + " svelte-15gqpwt"));
    			add_location(div1, file$b, 15, 0, 307);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, section);
    			if (if_block) if_block.m(section, null);
    			append_dev(section, t);
    			append_dev(section, div0);
    			append_dev(div0, h2);
    			h2.innerHTML = /*header*/ ctx[2];
    			/*section_binding*/ ctx[5](section);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*id*/ ctx[1] !== "ara") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					if_block.m(section, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*header*/ 4) h2.innerHTML = /*header*/ ctx[2];
    			if (dirty & /*id*/ 2 && section_class_value !== (section_class_value = "full chapter " + (/*id*/ ctx[1] !== "ara" ? "" : "short") + " svelte-15gqpwt")) {
    				attr_dev(section, "class", section_class_value);
    			}

    			if (dirty & /*id*/ 2) {
    				attr_dev(section, "id", /*id*/ ctx[1]);
    			}

    			if (dirty & /*id*/ 2 && div1_class_value !== (div1_class_value = "" + (null_to_empty(/*id*/ ctx[1] !== "ara" ? "chapter-wrapper" : "short") + " svelte-15gqpwt"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			/*section_binding*/ ctx[5](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const layout$2 = "";
    const audible$3 = false;

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Chapter", slots, []);
    	let { src } = $$props;
    	let { id } = $$props;
    	let { chapter } = $$props;
    	let { header } = $$props;
    	let pos, element;
    	const writable_props = ["src", "id", "chapter", "header"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Chapter> was created with unknown prop '${key}'`);
    	});

    	function section_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(3, element);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("chapter" in $$props) $$invalidate(4, chapter = $$props.chapter);
    		if ("header" in $$props) $$invalidate(2, header = $$props.header);
    	};

    	$$self.$capture_state = () => ({
    		Video,
    		src,
    		id,
    		chapter,
    		header,
    		layout: layout$2,
    		pos,
    		element,
    		audible: audible$3
    	});

    	$$self.$inject_state = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("chapter" in $$props) $$invalidate(4, chapter = $$props.chapter);
    		if ("header" in $$props) $$invalidate(2, header = $$props.header);
    		if ("pos" in $$props) pos = $$props.pos;
    		if ("element" in $$props) $$invalidate(3, element = $$props.element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*element, id*/ 10) {
    			if (element) $$invalidate(4, chapter[id] = { pos: element.offsetTop, id: element.id }, chapter);
    		}
    	};

    	return [src, id, header, element, chapter, section_binding];
    }

    class Chapter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { src: 0, id: 1, chapter: 4, header: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Chapter",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*src*/ ctx[0] === undefined && !("src" in props)) {
    			console.warn("<Chapter> was created without expected prop 'src'");
    		}

    		if (/*id*/ ctx[1] === undefined && !("id" in props)) {
    			console.warn("<Chapter> was created without expected prop 'id'");
    		}

    		if (/*chapter*/ ctx[4] === undefined && !("chapter" in props)) {
    			console.warn("<Chapter> was created without expected prop 'chapter'");
    		}

    		if (/*header*/ ctx[2] === undefined && !("header" in props)) {
    			console.warn("<Chapter> was created without expected prop 'header'");
    		}
    	}

    	get src() {
    		throw new Error("<Chapter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<Chapter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Chapter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Chapter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get chapter() {
    		throw new Error("<Chapter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set chapter(value) {
    		throw new Error("<Chapter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get header() {
    		throw new Error("<Chapter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set header(value) {
    		throw new Error("<Chapter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-intersection-observer/src/IntersectionObserver.svelte generated by Svelte v3.38.2 */

    const get_default_slot_changes = dirty => ({
    	intersecting: dirty & /*intersecting*/ 2,
    	entry: dirty & /*entry*/ 1,
    	observer: dirty & /*observer*/ 4
    });

    const get_default_slot_context = ctx => ({
    	intersecting: /*intersecting*/ ctx[1],
    	entry: /*entry*/ ctx[0],
    	observer: /*observer*/ ctx[2]
    });

    function create_fragment$d(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, intersecting, entry, observer*/ 263)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("IntersectionObserver", slots, ['default']);
    	let { element = null } = $$props;
    	let { once = false } = $$props;
    	let { root = null } = $$props;
    	let { rootMargin = "0px" } = $$props;
    	let { threshold = 0 } = $$props;
    	let { entry = null } = $$props;
    	let { intersecting = false } = $$props;
    	let { observer = null } = $$props;
    	const dispatch = createEventDispatcher();
    	let prevElement = null;

    	afterUpdate(async () => {
    		if (entry !== null) {
    			dispatch("observe", entry);

    			if (entry.isIntersecting) {
    				dispatch("intersect", entry);
    				if (once) observer.unobserve(entry.target);
    			}
    		}

    		await tick();

    		if (element !== null && element !== prevElement) {
    			observer.observe(element);
    			if (prevElement !== null) observer.unobserve(prevElement);
    			prevElement = element;
    		}
    	});

    	onMount(() => {
    		$$invalidate(2, observer = new IntersectionObserver(entries => {
    				entries.forEach(_entry => {
    					$$invalidate(0, entry = _entry);
    					$$invalidate(1, intersecting = _entry.isIntersecting);
    				});
    			},
    		{ root, rootMargin, threshold }));

    		return () => {
    			if (observer) observer.disconnect();
    		};
    	});

    	const writable_props = [
    		"element",
    		"once",
    		"root",
    		"rootMargin",
    		"threshold",
    		"entry",
    		"intersecting",
    		"observer"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<IntersectionObserver> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("element" in $$props) $$invalidate(3, element = $$props.element);
    		if ("once" in $$props) $$invalidate(4, once = $$props.once);
    		if ("root" in $$props) $$invalidate(5, root = $$props.root);
    		if ("rootMargin" in $$props) $$invalidate(6, rootMargin = $$props.rootMargin);
    		if ("threshold" in $$props) $$invalidate(7, threshold = $$props.threshold);
    		if ("entry" in $$props) $$invalidate(0, entry = $$props.entry);
    		if ("intersecting" in $$props) $$invalidate(1, intersecting = $$props.intersecting);
    		if ("observer" in $$props) $$invalidate(2, observer = $$props.observer);
    		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		element,
    		once,
    		root,
    		rootMargin,
    		threshold,
    		entry,
    		intersecting,
    		observer,
    		tick,
    		createEventDispatcher,
    		afterUpdate,
    		onMount,
    		dispatch,
    		prevElement
    	});

    	$$self.$inject_state = $$props => {
    		if ("element" in $$props) $$invalidate(3, element = $$props.element);
    		if ("once" in $$props) $$invalidate(4, once = $$props.once);
    		if ("root" in $$props) $$invalidate(5, root = $$props.root);
    		if ("rootMargin" in $$props) $$invalidate(6, rootMargin = $$props.rootMargin);
    		if ("threshold" in $$props) $$invalidate(7, threshold = $$props.threshold);
    		if ("entry" in $$props) $$invalidate(0, entry = $$props.entry);
    		if ("intersecting" in $$props) $$invalidate(1, intersecting = $$props.intersecting);
    		if ("observer" in $$props) $$invalidate(2, observer = $$props.observer);
    		if ("prevElement" in $$props) prevElement = $$props.prevElement;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		entry,
    		intersecting,
    		observer,
    		element,
    		once,
    		root,
    		rootMargin,
    		threshold,
    		$$scope,
    		slots
    	];
    }

    class IntersectionObserver_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			element: 3,
    			once: 4,
    			root: 5,
    			rootMargin: 6,
    			threshold: 7,
    			entry: 0,
    			intersecting: 1,
    			observer: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IntersectionObserver_1",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get element() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set element(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get once() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set once(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get root() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set root(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rootMargin() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rootMargin(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get threshold() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set threshold(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get entry() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set entry(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get intersecting() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set intersecting(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get observer() {
    		throw new Error("<IntersectionObserver>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set observer(value) {
    		throw new Error("<IntersectionObserver>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/multimedia/ChapterVideo.svelte generated by Svelte v3.38.2 */
    const file$a = "src/components/multimedia/ChapterVideo.svelte";

    // (19:0) <IntersectionObserver {element} bind:intersecting threshold=.7>
    function create_default_slot$2(ctx) {
    	let section;
    	let video;
    	let current;

    	video = new Video({
    			props: {
    				src: /*src*/ ctx[0],
    				captions: /*captions*/ ctx[2],
    				layout: layout$1,
    				controls: "",
    				scroll: "false",
    				audible: audible$2
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(video.$$.fragment);
    			attr_dev(section, "class", "full chapter");
    			attr_dev(section, "id", /*id*/ ctx[1]);
    			add_location(section, file$a, 19, 0, 418);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(video, section, null);
    			/*section_binding*/ ctx[6](section);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const video_changes = {};
    			if (dirty & /*src*/ 1) video_changes.src = /*src*/ ctx[0];
    			if (dirty & /*captions*/ 4) video_changes.captions = /*captions*/ ctx[2];
    			video.$set(video_changes);

    			if (!current || dirty & /*id*/ 2) {
    				attr_dev(section, "id", /*id*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(video.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(video.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(video);
    			/*section_binding*/ ctx[6](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(19:0) <IntersectionObserver {element} bind:intersecting threshold=.7>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let intersectionobserver;
    	let updating_intersecting;
    	let current;

    	function intersectionobserver_intersecting_binding(value) {
    		/*intersectionobserver_intersecting_binding*/ ctx[7](value);
    	}

    	let intersectionobserver_props = {
    		element: /*element*/ ctx[3],
    		threshold: ".7",
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	};

    	if (/*intersecting*/ ctx[4] !== void 0) {
    		intersectionobserver_props.intersecting = /*intersecting*/ ctx[4];
    	}

    	intersectionobserver = new IntersectionObserver_1({
    			props: intersectionobserver_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(intersectionobserver, "intersecting", intersectionobserver_intersecting_binding));

    	const block = {
    		c: function create() {
    			create_component(intersectionobserver.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(intersectionobserver, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const intersectionobserver_changes = {};
    			if (dirty & /*element*/ 8) intersectionobserver_changes.element = /*element*/ ctx[3];

    			if (dirty & /*$$scope, id, element, src, captions*/ 271) {
    				intersectionobserver_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_intersecting && dirty & /*intersecting*/ 16) {
    				updating_intersecting = true;
    				intersectionobserver_changes.intersecting = /*intersecting*/ ctx[4];
    				add_flush_callback(() => updating_intersecting = false);
    			}

    			intersectionobserver.$set(intersectionobserver_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(intersectionobserver.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(intersectionobserver.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(intersectionobserver, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const layout$1 = "cover";
    const audible$2 = false;

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ChapterVideo", slots, []);
    	let { src } = $$props;
    	let { id } = $$props;
    	let { captions } = $$props;
    	let { color } = $$props;
    	let element;
    	let intersecting;
    	const writable_props = ["src", "id", "captions", "color"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ChapterVideo> was created with unknown prop '${key}'`);
    	});

    	function section_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(3, element);
    		});
    	}

    	function intersectionobserver_intersecting_binding(value) {
    		intersecting = value;
    		$$invalidate(4, intersecting);
    	}

    	$$self.$$set = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("captions" in $$props) $$invalidate(2, captions = $$props.captions);
    		if ("color" in $$props) $$invalidate(5, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({
    		IntersectionObserver: IntersectionObserver_1,
    		Video,
    		src,
    		id,
    		captions,
    		color,
    		layout: layout$1,
    		audible: audible$2,
    		element,
    		intersecting
    	});

    	$$self.$inject_state = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("captions" in $$props) $$invalidate(2, captions = $$props.captions);
    		if ("color" in $$props) $$invalidate(5, color = $$props.color);
    		if ("element" in $$props) $$invalidate(3, element = $$props.element);
    		if ("intersecting" in $$props) $$invalidate(4, intersecting = $$props.intersecting);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*intersecting, element*/ 24) {
    			$$invalidate(5, color = intersecting && element.id);
    		}
    	};

    	return [
    		src,
    		id,
    		captions,
    		element,
    		intersecting,
    		color,
    		section_binding,
    		intersectionobserver_intersecting_binding
    	];
    }

    class ChapterVideo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { src: 0, id: 1, captions: 2, color: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ChapterVideo",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*src*/ ctx[0] === undefined && !("src" in props)) {
    			console.warn("<ChapterVideo> was created without expected prop 'src'");
    		}

    		if (/*id*/ ctx[1] === undefined && !("id" in props)) {
    			console.warn("<ChapterVideo> was created without expected prop 'id'");
    		}

    		if (/*captions*/ ctx[2] === undefined && !("captions" in props)) {
    			console.warn("<ChapterVideo> was created without expected prop 'captions'");
    		}

    		if (/*color*/ ctx[5] === undefined && !("color" in props)) {
    			console.warn("<ChapterVideo> was created without expected prop 'color'");
    		}
    	}

    	get src() {
    		throw new Error("<ChapterVideo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<ChapterVideo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<ChapterVideo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<ChapterVideo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get captions() {
    		throw new Error("<ChapterVideo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set captions(value) {
    		throw new Error("<ChapterVideo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<ChapterVideo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<ChapterVideo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/multimedia/InterviewVideo.svelte generated by Svelte v3.38.2 */
    const file$9 = "src/components/multimedia/InterviewVideo.svelte";

    // (34:4) {:else}
    function create_else_block$1(ctx) {
    	let scroller;
    	let updating_index;
    	let updating_offset;
    	let current;

    	function scroller_index_binding(value) {
    		/*scroller_index_binding*/ ctx[13](value);
    	}

    	function scroller_offset_binding(value) {
    		/*scroller_offset_binding*/ ctx[14](value);
    	}

    	let scroller_props = {
    		threshold: ".3",
    		$$slots: {
    			background: [create_background_slot$1],
    			foreground: [create_foreground_slot$1]
    		},
    		$$scope: { ctx }
    	};

    	if (/*index*/ ctx[6] !== void 0) {
    		scroller_props.index = /*index*/ ctx[6];
    	}

    	if (/*offset*/ ctx[7] !== void 0) {
    		scroller_props.offset = /*offset*/ ctx[7];
    	}

    	scroller = new Scroller({ props: scroller_props, $$inline: true });
    	binding_callbacks.push(() => bind(scroller, "index", scroller_index_binding));
    	binding_callbacks.push(() => bind(scroller, "offset", scroller_offset_binding));

    	const block = {
    		c: function create() {
    			create_component(scroller.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(scroller, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const scroller_changes = {};

    			if (dirty & /*$$scope, src, captions, intersecting, id, element, header*/ 65847) {
    				scroller_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_index && dirty & /*index*/ 64) {
    				updating_index = true;
    				scroller_changes.index = /*index*/ ctx[6];
    				add_flush_callback(() => updating_index = false);
    			}

    			if (!updating_offset && dirty & /*offset*/ 128) {
    				updating_offset = true;
    				scroller_changes.offset = /*offset*/ ctx[7];
    				add_flush_callback(() => updating_offset = false);
    			}

    			scroller.$set(scroller_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(scroller.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(scroller.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(scroller, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(34:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (21:4) {#if size === 'small'}
    function create_if_block$3(ctx) {
    	let section_1;
    	let h4;
    	let t0;
    	let t1;
    	let video;
    	let section_1_class_value;
    	let current;

    	video = new Video({
    			props: {
    				src: /*src*/ ctx[0],
    				captions: /*captions*/ ctx[2],
    				layout: /*layout*/ ctx[9],
    				controls: "controls",
    				scroll: "false",
    				active: /*intersecting*/ ctx[8],
    				audible: audible$1
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section_1 = element("section");
    			h4 = element("h4");
    			t0 = text(/*header*/ ctx[4]);
    			t1 = space();
    			create_component(video.$$.fragment);
    			attr_dev(h4, "class", "title svelte-9cmbma");
    			add_location(h4, file$9, 22, 8, 711);
    			attr_dev(section_1, "class", section_1_class_value = "" + (/*section*/ ctx[10] + " interview " + (/*intersecting*/ ctx[8] ? "visible" : "invisible") + " svelte-9cmbma"));
    			attr_dev(section_1, "id", /*id*/ ctx[1]);
    			add_location(section_1, file$9, 21, 4, 599);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section_1, anchor);
    			append_dev(section_1, h4);
    			append_dev(h4, t0);
    			append_dev(section_1, t1);
    			mount_component(video, section_1, null);
    			/*section_1_binding*/ ctx[11](section_1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*header*/ 16) set_data_dev(t0, /*header*/ ctx[4]);
    			const video_changes = {};
    			if (dirty & /*src*/ 1) video_changes.src = /*src*/ ctx[0];
    			if (dirty & /*captions*/ 4) video_changes.captions = /*captions*/ ctx[2];
    			if (dirty & /*intersecting*/ 256) video_changes.active = /*intersecting*/ ctx[8];
    			video.$set(video_changes);

    			if (!current || dirty & /*intersecting*/ 256 && section_1_class_value !== (section_1_class_value = "" + (/*section*/ ctx[10] + " interview " + (/*intersecting*/ ctx[8] ? "visible" : "invisible") + " svelte-9cmbma"))) {
    				attr_dev(section_1, "class", section_1_class_value);
    			}

    			if (!current || dirty & /*id*/ 2) {
    				attr_dev(section_1, "id", /*id*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(video.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(video.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section_1);
    			destroy_component(video);
    			/*section_1_binding*/ ctx[11](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(21:4) {#if size === 'small'}",
    		ctx
    	});

    	return block;
    }

    // (36:12) 
    function create_foreground_slot$1(ctx) {
    	let div;
    	let section_1;
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			section_1 = element("section");
    			p = element("p");
    			t = text(/*header*/ ctx[4]);
    			attr_dev(p, "class", "not-interactive svelte-9cmbma");
    			add_location(p, file$9, 36, 68, 1179);
    			attr_dev(section_1, "class", "not-interactive long-text col-text svelte-9cmbma");
    			add_location(section_1, file$9, 36, 16, 1127);
    			attr_dev(div, "class", "not-interactive svelte-9cmbma");
    			attr_dev(div, "slot", "foreground");
    			attr_dev(div, "id", /*id*/ ctx[1]);
    			add_location(div, file$9, 35, 12, 1038);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, section_1);
    			append_dev(section_1, p);
    			append_dev(p, t);
    			/*div_binding*/ ctx[12](div);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*header*/ 16) set_data_dev(t, /*header*/ ctx[4]);

    			if (dirty & /*id*/ 2) {
    				attr_dev(div, "id", /*id*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[12](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_foreground_slot$1.name,
    		type: "slot",
    		source: "(36:12) ",
    		ctx
    	});

    	return block;
    }

    // (39:12) 
    function create_background_slot$1(ctx) {
    	let div;
    	let video;
    	let current;

    	video = new Video({
    			props: {
    				src: /*src*/ ctx[0],
    				captions: /*captions*/ ctx[2],
    				layout: /*layout*/ ctx[9],
    				controls: "controls",
    				scroll: "false",
    				active: /*intersecting*/ ctx[8],
    				audible: audible$1
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(video.$$.fragment);
    			attr_dev(div, "class", "full");
    			attr_dev(div, "slot", "background");
    			add_location(div, file$9, 38, 12, 1260);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(video, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const video_changes = {};
    			if (dirty & /*src*/ 1) video_changes.src = /*src*/ ctx[0];
    			if (dirty & /*captions*/ 4) video_changes.captions = /*captions*/ ctx[2];
    			if (dirty & /*intersecting*/ 256) video_changes.active = /*intersecting*/ ctx[8];
    			video.$set(video_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(video.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(video.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(video);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_background_slot$1.name,
    		type: "slot",
    		source: "(39:12) ",
    		ctx
    	});

    	return block;
    }

    // (20:0) <IntersectionObserver {element} bind:intersecting threshold=.5>
    function create_default_slot$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*size*/ ctx[3] === "small") return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(20:0) <IntersectionObserver {element} bind:intersecting threshold=.5>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let intersectionobserver;
    	let updating_intersecting;
    	let current;

    	function intersectionobserver_intersecting_binding(value) {
    		/*intersectionobserver_intersecting_binding*/ ctx[15](value);
    	}

    	let intersectionobserver_props = {
    		element: /*element*/ ctx[5],
    		threshold: ".5",
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	};

    	if (/*intersecting*/ ctx[8] !== void 0) {
    		intersectionobserver_props.intersecting = /*intersecting*/ ctx[8];
    	}

    	intersectionobserver = new IntersectionObserver_1({
    			props: intersectionobserver_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(intersectionobserver, "intersecting", intersectionobserver_intersecting_binding));

    	const block = {
    		c: function create() {
    			create_component(intersectionobserver.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(intersectionobserver, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const intersectionobserver_changes = {};
    			if (dirty & /*element*/ 32) intersectionobserver_changes.element = /*element*/ ctx[5];

    			if (dirty & /*$$scope, intersecting, id, element, src, captions, header, size, index, offset*/ 66047) {
    				intersectionobserver_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_intersecting && dirty & /*intersecting*/ 256) {
    				updating_intersecting = true;
    				intersectionobserver_changes.intersecting = /*intersecting*/ ctx[8];
    				add_flush_callback(() => updating_intersecting = false);
    			}

    			intersectionobserver.$set(intersectionobserver_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(intersectionobserver.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(intersectionobserver.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(intersectionobserver, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const audible$1 = true;

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("InterviewVideo", slots, []);
    	let { src } = $$props;
    	let { id } = $$props;
    	let { captions } = $$props;
    	let { size } = $$props;
    	let { header } = $$props;
    	const layout = size === "small" ? "col-text" : "cover";
    	const section = size === "small" ? "col-text" : "chapter";
    	let element, index = 0, offset;
    	let intersecting;
    	const writable_props = ["src", "id", "captions", "size", "header"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<InterviewVideo> was created with unknown prop '${key}'`);
    	});

    	function section_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(5, element);
    		});
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(5, element);
    		});
    	}

    	function scroller_index_binding(value) {
    		index = value;
    		$$invalidate(6, index);
    	}

    	function scroller_offset_binding(value) {
    		offset = value;
    		$$invalidate(7, offset);
    	}

    	function intersectionobserver_intersecting_binding(value) {
    		intersecting = value;
    		$$invalidate(8, intersecting);
    	}

    	$$self.$$set = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("captions" in $$props) $$invalidate(2, captions = $$props.captions);
    		if ("size" in $$props) $$invalidate(3, size = $$props.size);
    		if ("header" in $$props) $$invalidate(4, header = $$props.header);
    	};

    	$$self.$capture_state = () => ({
    		IntersectionObserver: IntersectionObserver_1,
    		Scroller,
    		Video,
    		src,
    		id,
    		captions,
    		size,
    		header,
    		layout,
    		section,
    		audible: audible$1,
    		element,
    		index,
    		offset,
    		intersecting
    	});

    	$$self.$inject_state = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("captions" in $$props) $$invalidate(2, captions = $$props.captions);
    		if ("size" in $$props) $$invalidate(3, size = $$props.size);
    		if ("header" in $$props) $$invalidate(4, header = $$props.header);
    		if ("element" in $$props) $$invalidate(5, element = $$props.element);
    		if ("index" in $$props) $$invalidate(6, index = $$props.index);
    		if ("offset" in $$props) $$invalidate(7, offset = $$props.offset);
    		if ("intersecting" in $$props) $$invalidate(8, intersecting = $$props.intersecting);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		src,
    		id,
    		captions,
    		size,
    		header,
    		element,
    		index,
    		offset,
    		intersecting,
    		layout,
    		section,
    		section_1_binding,
    		div_binding,
    		scroller_index_binding,
    		scroller_offset_binding,
    		intersectionobserver_intersecting_binding
    	];
    }

    class InterviewVideo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			src: 0,
    			id: 1,
    			captions: 2,
    			size: 3,
    			header: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InterviewVideo",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*src*/ ctx[0] === undefined && !("src" in props)) {
    			console.warn("<InterviewVideo> was created without expected prop 'src'");
    		}

    		if (/*id*/ ctx[1] === undefined && !("id" in props)) {
    			console.warn("<InterviewVideo> was created without expected prop 'id'");
    		}

    		if (/*captions*/ ctx[2] === undefined && !("captions" in props)) {
    			console.warn("<InterviewVideo> was created without expected prop 'captions'");
    		}

    		if (/*size*/ ctx[3] === undefined && !("size" in props)) {
    			console.warn("<InterviewVideo> was created without expected prop 'size'");
    		}

    		if (/*header*/ ctx[4] === undefined && !("header" in props)) {
    			console.warn("<InterviewVideo> was created without expected prop 'header'");
    		}
    	}

    	get src() {
    		throw new Error("<InterviewVideo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<InterviewVideo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<InterviewVideo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<InterviewVideo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get captions() {
    		throw new Error("<InterviewVideo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set captions(value) {
    		throw new Error("<InterviewVideo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<InterviewVideo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<InterviewVideo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get header() {
    		throw new Error("<InterviewVideo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set header(value) {
    		throw new Error("<InterviewVideo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/text/Notes.svelte generated by Svelte v3.38.2 */
    const file$8 = "src/components/text/Notes.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (20:8) {#each list as li}
    function create_each_block$6(ctx) {
    	let li;
    	let raw_value = /*li*/ ctx[8] + "";

    	const block = {
    		c: function create() {
    			li = element("li");
    			add_location(li, file$8, 20, 8, 362);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			li.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*list*/ 4 && raw_value !== (raw_value = /*li*/ ctx[8] + "")) li.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(20:8) {#each list as li}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let section;
    	let text_1;
    	let t;
    	let ul;
    	let current;

    	text_1 = new Text({
    			props: {
    				text: /*text*/ ctx[0],
    				header: /*header*/ ctx[1],
    				dropcap: "false"
    			},
    			$$inline: true
    		});

    	let each_value = /*list*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(text_1.$$.fragment);
    			t = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(ul, file$8, 18, 4, 322);
    			attr_dev(section, "class", "col-text thanks svelte-wd9vi5");
    			add_location(section, file$8, 12, 0, 190);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(text_1, section, null);
    			append_dev(section, t);
    			append_dev(section, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			/*section_binding*/ ctx[6](section);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const text_1_changes = {};
    			if (dirty & /*text*/ 1) text_1_changes.text = /*text*/ ctx[0];
    			if (dirty & /*header*/ 2) text_1_changes.header = /*header*/ ctx[1];
    			text_1.$set(text_1_changes);

    			if (dirty & /*list*/ 4) {
    				each_value = /*list*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(text_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(text_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(text_1);
    			destroy_each(each_blocks, detaching);
    			/*section_binding*/ ctx[6](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Notes", slots, []);
    	let { text } = $$props;
    	let { header } = $$props;
    	let { list } = $$props;
    	let { id } = $$props;
    	let { chapter } = $$props;
    	let pos, element;
    	const writable_props = ["text", "header", "list", "id", "chapter"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Notes> was created with unknown prop '${key}'`);
    	});

    	function section_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			element = $$value;
    			$$invalidate(3, element);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("header" in $$props) $$invalidate(1, header = $$props.header);
    		if ("list" in $$props) $$invalidate(2, list = $$props.list);
    		if ("id" in $$props) $$invalidate(4, id = $$props.id);
    		if ("chapter" in $$props) $$invalidate(5, chapter = $$props.chapter);
    	};

    	$$self.$capture_state = () => ({
    		Text,
    		text,
    		header,
    		list,
    		id,
    		chapter,
    		pos,
    		element
    	});

    	$$self.$inject_state = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("header" in $$props) $$invalidate(1, header = $$props.header);
    		if ("list" in $$props) $$invalidate(2, list = $$props.list);
    		if ("id" in $$props) $$invalidate(4, id = $$props.id);
    		if ("chapter" in $$props) $$invalidate(5, chapter = $$props.chapter);
    		if ("pos" in $$props) pos = $$props.pos;
    		if ("element" in $$props) $$invalidate(3, element = $$props.element);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text, header, list, element, id, chapter, section_binding];
    }

    class Notes extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			text: 0,
    			header: 1,
    			list: 2,
    			id: 4,
    			chapter: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Notes",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*text*/ ctx[0] === undefined && !("text" in props)) {
    			console.warn("<Notes> was created without expected prop 'text'");
    		}

    		if (/*header*/ ctx[1] === undefined && !("header" in props)) {
    			console.warn("<Notes> was created without expected prop 'header'");
    		}

    		if (/*list*/ ctx[2] === undefined && !("list" in props)) {
    			console.warn("<Notes> was created without expected prop 'list'");
    		}

    		if (/*id*/ ctx[4] === undefined && !("id" in props)) {
    			console.warn("<Notes> was created without expected prop 'id'");
    		}

    		if (/*chapter*/ ctx[5] === undefined && !("chapter" in props)) {
    			console.warn("<Notes> was created without expected prop 'chapter'");
    		}
    	}

    	get text() {
    		throw new Error("<Notes>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Notes>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get header() {
    		throw new Error("<Notes>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set header(value) {
    		throw new Error("<Notes>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get list() {
    		throw new Error("<Notes>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set list(value) {
    		throw new Error("<Notes>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Notes>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Notes>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get chapter() {
    		throw new Error("<Notes>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set chapter(value) {
    		throw new Error("<Notes>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/text/Quote.svelte generated by Svelte v3.38.2 */

    const file$7 = "src/components/text/Quote.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (8:2) {#each quote as q}
    function create_each_block$5(ctx) {
    	let p;
    	let raw_value = /*q*/ ctx[2].p + "";

    	const block = {
    		c: function create() {
    			p = element("p");
    			attr_dev(p, "class", "svelte-1m00pe4");
    			add_location(p, file$7, 8, 4, 164);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			p.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*quote*/ 1 && raw_value !== (raw_value = /*q*/ ctx[2].p + "")) p.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(8:2) {#each quote as q}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let figure;
    	let blockquote;
    	let t0;
    	let cite;
    	let t1;
    	let html_tag;
    	let each_value = /*quote*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			figure = element("figure");
    			blockquote = element("blockquote");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			cite = element("cite");
    			t1 = text("—");
    			html_tag = new HtmlTag(null);
    			attr_dev(cite, "class", "cite svelte-1m00pe4");
    			add_location(cite, file$7, 10, 3, 196);
    			attr_dev(blockquote, "class", "quote svelte-1m00pe4");
    			add_location(blockquote, file$7, 6, 2, 112);
    			attr_dev(figure, "class", "quote-wrapper col-text");
    			add_location(figure, file$7, 5, 0, 70);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, figure, anchor);
    			append_dev(figure, blockquote);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(blockquote, null);
    			}

    			append_dev(blockquote, t0);
    			append_dev(blockquote, cite);
    			append_dev(cite, t1);
    			html_tag.m(/*attribution*/ ctx[1], cite);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*quote*/ 1) {
    				each_value = /*quote*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(blockquote, t0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*attribution*/ 2) html_tag.p(/*attribution*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(figure);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Quote", slots, []);
    	let { quote } = $$props;
    	let { attribution } = $$props;
    	const writable_props = ["quote", "attribution"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Quote> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("quote" in $$props) $$invalidate(0, quote = $$props.quote);
    		if ("attribution" in $$props) $$invalidate(1, attribution = $$props.attribution);
    	};

    	$$self.$capture_state = () => ({ quote, attribution });

    	$$self.$inject_state = $$props => {
    		if ("quote" in $$props) $$invalidate(0, quote = $$props.quote);
    		if ("attribution" in $$props) $$invalidate(1, attribution = $$props.attribution);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [quote, attribution];
    }

    class Quote extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { quote: 0, attribution: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Quote",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*quote*/ ctx[0] === undefined && !("quote" in props)) {
    			console.warn("<Quote> was created without expected prop 'quote'");
    		}

    		if (/*attribution*/ ctx[1] === undefined && !("attribution" in props)) {
    			console.warn("<Quote> was created without expected prop 'attribution'");
    		}
    	}

    	get quote() {
    		throw new Error("<Quote>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set quote(value) {
    		throw new Error("<Quote>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get attribution() {
    		throw new Error("<Quote>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set attribution(value) {
    		throw new Error("<Quote>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // Adapted from https://github.com/hperrin/svelte-material-ui/blob/master/packages/common/forwardEvents.js

    // prettier-ignore
    const events = [
        'focus', 'blur',
        'fullscreenchange', 'fullscreenerror', 'scroll',
        'cut', 'copy', 'paste',
        'keydown', 'keypress', 'keyup',
        'auxclick', 'click', 'contextmenu', 'dblclick',
        'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseover', 'mouseout', 'mouseup',
        'pointerlockchange', 'pointerlockerror', 'select', 'wheel',
        'drag', 'dragend', 'dragenter', 'dragstart', 'dragleave', 'dragover', 'drop',
        'touchcancel', 'touchend', 'touchmove', 'touchstart',
        'pointerover', 'pointerenter', 'pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'pointerout', 'pointerleave', 
        'gotpointercapture', 'lostpointercapture'
      ];

    function forwardEventsBuilder() {
      const component = current_component;

      return node => {
        const destructors = events.map(event =>
          listen(node, event, e => bubble(component, e))
        );

        return {
          destroy: () => destructors.forEach(destroy => destroy())
        };
      };
    }

    /* node_modules/svelte-canvas/src/Canvas.svelte generated by Svelte v3.38.2 */
    const file$6 = "node_modules/svelte-canvas/src/Canvas.svelte";

    function create_fragment$8(ctx) {
    	let canvas_1;
    	let canvas_1_style_value;
    	let canvas_1_width_value;
    	let canvas_1_height_value;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

    	const block = {
    		c: function create() {
    			canvas_1 = element("canvas");
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(canvas_1, "style", canvas_1_style_value = "width: " + /*width*/ ctx[1] + "px; height: " + /*height*/ ctx[2] + "px;" + (/*style*/ ctx[3] ? ` ${/*style*/ ctx[3]}` : ""));
    			attr_dev(canvas_1, "width", canvas_1_width_value = /*width*/ ctx[1] * /*pixelRatio*/ ctx[0]);
    			attr_dev(canvas_1, "height", canvas_1_height_value = /*height*/ ctx[2] * /*pixelRatio*/ ctx[0]);
    			attr_dev(canvas_1, "class", "svelte-o3oskp");
    			add_location(canvas_1, file$6, 111, 0, 2306);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, canvas_1, anchor);
    			/*canvas_1_binding*/ ctx[12](canvas_1);
    			insert_dev(target, t, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(/*forwardEvents*/ ctx[5].call(null, canvas_1));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*width, height, style*/ 14 && canvas_1_style_value !== (canvas_1_style_value = "width: " + /*width*/ ctx[1] + "px; height: " + /*height*/ ctx[2] + "px;" + (/*style*/ ctx[3] ? ` ${/*style*/ ctx[3]}` : ""))) {
    				attr_dev(canvas_1, "style", canvas_1_style_value);
    			}

    			if (!current || dirty & /*width, pixelRatio*/ 3 && canvas_1_width_value !== (canvas_1_width_value = /*width*/ ctx[1] * /*pixelRatio*/ ctx[0])) {
    				attr_dev(canvas_1, "width", canvas_1_width_value);
    			}

    			if (!current || dirty & /*height, pixelRatio*/ 5 && canvas_1_height_value !== (canvas_1_height_value = /*height*/ ctx[2] * /*pixelRatio*/ ctx[0])) {
    				attr_dev(canvas_1, "height", canvas_1_height_value);
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1024)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(canvas_1);
    			/*canvas_1_binding*/ ctx[12](null);
    			if (detaching) detach_dev(t);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const KEY = {};

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Canvas", slots, ['default']);
    	const forwardEvents = forwardEventsBuilder();
    	let canvas, context;
    	let redrawNeeded = true, resizeNeeded = true, resortNeeded = true;
    	let setups = [], renderers = [], prioritized = [];

    	let { width = 640 } = $$props,
    		{ height = 640 } = $$props,
    		{ pixelRatio = undefined } = $$props,
    		{ style = null } = $$props,
    		{ autoclear = true } = $$props;

    	const getCanvas = () => canvas,
    		getContext = () => context,
    		redraw = () => redrawNeeded = true;

    	const resize = () => resizeNeeded = true, priorityChange = () => resortNeeded = true;

    	const draw = () => {
    		if (resizeNeeded) {
    			context.scale(pixelRatio, pixelRatio);
    			resizeNeeded = false;
    		}

    		if (resortNeeded) {
    			prioritized = renderers.map((renderer, i) => {
    				const rank = renderer.priority();
    				renderer.rank = rank || i - renderers.length;
    				return renderer;
    			}).sort((a, b) => a.rank - b.rank);

    			resortNeeded = false;
    		}

    		if (setups.length !== 0) {
    			for (let setup of setups) {
    				setup({ context, width, height });
    				setups.splice(setups.indexOf(setup), 1);
    			}

    			redrawNeeded = true;
    		}

    		if (redrawNeeded) {
    			if (autoclear) {
    				context.clearRect(0, 0, width, height);
    			}

    			for (let { render } of prioritized) {
    				render({ context, width, height });
    			}

    			redrawNeeded = false;
    		}

    		window.requestAnimationFrame(draw);
    	};

    	const register = ({ setup, renderer }) => {
    		if (setup) setups.push(setup);
    		renderers.push(renderer);

    		onDestroy(() => {
    			renderers.splice(renderers.indexOf(renderer), 1);
    			priorityChange();
    			redraw();
    		});
    	};

    	setContext(KEY, { register, redraw, priorityChange });

    	if (pixelRatio === undefined) {
    		if (typeof window === "undefined") {
    			pixelRatio = 2;
    		} else {
    			pixelRatio = window.devicePixelRatio;
    		}
    	}

    	onMount(() => {
    		context = canvas.getContext("2d");
    		draw();
    	});

    	const writable_props = ["width", "height", "pixelRatio", "style", "autoclear"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Canvas> was created with unknown prop '${key}'`);
    	});

    	function canvas_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			canvas = $$value;
    			$$invalidate(4, canvas);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("height" in $$props) $$invalidate(2, height = $$props.height);
    		if ("pixelRatio" in $$props) $$invalidate(0, pixelRatio = $$props.pixelRatio);
    		if ("style" in $$props) $$invalidate(3, style = $$props.style);
    		if ("autoclear" in $$props) $$invalidate(6, autoclear = $$props.autoclear);
    		if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		KEY,
    		onMount,
    		onDestroy,
    		setContext,
    		forwardEventsBuilder,
    		forwardEvents,
    		canvas,
    		context,
    		redrawNeeded,
    		resizeNeeded,
    		resortNeeded,
    		setups,
    		renderers,
    		prioritized,
    		width,
    		height,
    		pixelRatio,
    		style,
    		autoclear,
    		getCanvas,
    		getContext,
    		redraw,
    		resize,
    		priorityChange,
    		draw,
    		register
    	});

    	$$self.$inject_state = $$props => {
    		if ("canvas" in $$props) $$invalidate(4, canvas = $$props.canvas);
    		if ("context" in $$props) context = $$props.context;
    		if ("redrawNeeded" in $$props) redrawNeeded = $$props.redrawNeeded;
    		if ("resizeNeeded" in $$props) resizeNeeded = $$props.resizeNeeded;
    		if ("resortNeeded" in $$props) resortNeeded = $$props.resortNeeded;
    		if ("setups" in $$props) setups = $$props.setups;
    		if ("renderers" in $$props) renderers = $$props.renderers;
    		if ("prioritized" in $$props) prioritized = $$props.prioritized;
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("height" in $$props) $$invalidate(2, height = $$props.height);
    		if ("pixelRatio" in $$props) $$invalidate(0, pixelRatio = $$props.pixelRatio);
    		if ("style" in $$props) $$invalidate(3, style = $$props.style);
    		if ("autoclear" in $$props) $$invalidate(6, autoclear = $$props.autoclear);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*width, height, pixelRatio, autoclear*/ 71) {
    			(resize(), redraw());
    		}
    	};

    	return [
    		pixelRatio,
    		width,
    		height,
    		style,
    		canvas,
    		forwardEvents,
    		autoclear,
    		getCanvas,
    		getContext,
    		redraw,
    		$$scope,
    		slots,
    		canvas_1_binding
    	];
    }

    class Canvas extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			width: 1,
    			height: 2,
    			pixelRatio: 0,
    			style: 3,
    			autoclear: 6,
    			getCanvas: 7,
    			getContext: 8,
    			redraw: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Canvas",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get width() {
    		throw new Error("<Canvas>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Canvas>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pixelRatio() {
    		throw new Error("<Canvas>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pixelRatio(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Canvas>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autoclear() {
    		throw new Error("<Canvas>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autoclear(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getCanvas() {
    		return this.$$.ctx[7];
    	}

    	set getCanvas(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getContext() {
    		return this.$$.ctx[8];
    	}

    	set getContext(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get redraw() {
    		return this.$$.ctx[9];
    	}

    	set redraw(value) {
    		throw new Error("<Canvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-canvas/src/Layer.svelte generated by Svelte v3.38.2 */

    const { Error: Error_1 } = globals;

    function create_fragment$7(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Layer", slots, []);
    	const { register, redraw, priorityChange } = getContext(KEY);

    	let { setup = undefined } = $$props,
    		{ render = () => {
    			
    		} } = $$props,
    		{ priority = undefined } = $$props;

    	if (typeof setup !== "function" && setup !== undefined) {
    		throw new Error("setup must be a function");
    	}

    	if (typeof render !== "function") {
    		throw new Error("render must be a function");
    	}

    	if (priority && (!Number.isInteger(priority) || priority <= 0)) {
    		throw new Error("priority must be a positive integer");
    	}

    	register({
    		setup,
    		renderer: { render, priority: () => priority }
    	});

    	const writable_props = ["setup", "render", "priority"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Layer> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("setup" in $$props) $$invalidate(0, setup = $$props.setup);
    		if ("render" in $$props) $$invalidate(1, render = $$props.render);
    		if ("priority" in $$props) $$invalidate(2, priority = $$props.priority);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		KEY,
    		register,
    		redraw,
    		priorityChange,
    		setup,
    		render,
    		priority
    	});

    	$$self.$inject_state = $$props => {
    		if ("setup" in $$props) $$invalidate(0, setup = $$props.setup);
    		if ("render" in $$props) $$invalidate(1, render = $$props.render);
    		if ("priority" in $$props) $$invalidate(2, priority = $$props.priority);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*priority*/ 4) {
    			(priorityChange());
    		}

    		if ($$self.$$.dirty & /*priority, render*/ 6) {
    			(redraw());
    		}
    	};

    	return [setup, render, priority];
    }

    class Layer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { setup: 0, render: 1, priority: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Layer",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get setup() {
    		throw new Error_1("<Layer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set setup(value) {
    		throw new Error_1("<Layer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get render() {
    		throw new Error_1("<Layer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set render(value) {
    		throw new Error_1("<Layer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get priority() {
    		throw new Error_1("<Layer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set priority(value) {
    		throw new Error_1("<Layer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const EPSILON = Math.pow(2, -52);
    const EDGE_STACK = new Uint32Array(512);

    class Delaunator {

        static from(points, getX = defaultGetX, getY = defaultGetY) {
            const n = points.length;
            const coords = new Float64Array(n * 2);

            for (let i = 0; i < n; i++) {
                const p = points[i];
                coords[2 * i] = getX(p);
                coords[2 * i + 1] = getY(p);
            }

            return new Delaunator(coords);
        }

        constructor(coords) {
            const n = coords.length >> 1;
            if (n > 0 && typeof coords[0] !== 'number') throw new Error('Expected coords to contain numbers.');

            this.coords = coords;

            // arrays that will store the triangulation graph
            const maxTriangles = Math.max(2 * n - 5, 0);
            this._triangles = new Uint32Array(maxTriangles * 3);
            this._halfedges = new Int32Array(maxTriangles * 3);

            // temporary arrays for tracking the edges of the advancing convex hull
            this._hashSize = Math.ceil(Math.sqrt(n));
            this._hullPrev = new Uint32Array(n); // edge to prev edge
            this._hullNext = new Uint32Array(n); // edge to next edge
            this._hullTri = new Uint32Array(n); // edge to adjacent triangle
            this._hullHash = new Int32Array(this._hashSize).fill(-1); // angular edge hash

            // temporary arrays for sorting points
            this._ids = new Uint32Array(n);
            this._dists = new Float64Array(n);

            this.update();
        }

        update() {
            const {coords, _hullPrev: hullPrev, _hullNext: hullNext, _hullTri: hullTri, _hullHash: hullHash} =  this;
            const n = coords.length >> 1;

            // populate an array of point indices; calculate input data bbox
            let minX = Infinity;
            let minY = Infinity;
            let maxX = -Infinity;
            let maxY = -Infinity;

            for (let i = 0; i < n; i++) {
                const x = coords[2 * i];
                const y = coords[2 * i + 1];
                if (x < minX) minX = x;
                if (y < minY) minY = y;
                if (x > maxX) maxX = x;
                if (y > maxY) maxY = y;
                this._ids[i] = i;
            }
            const cx = (minX + maxX) / 2;
            const cy = (minY + maxY) / 2;

            let minDist = Infinity;
            let i0, i1, i2;

            // pick a seed point close to the center
            for (let i = 0; i < n; i++) {
                const d = dist(cx, cy, coords[2 * i], coords[2 * i + 1]);
                if (d < minDist) {
                    i0 = i;
                    minDist = d;
                }
            }
            const i0x = coords[2 * i0];
            const i0y = coords[2 * i0 + 1];

            minDist = Infinity;

            // find the point closest to the seed
            for (let i = 0; i < n; i++) {
                if (i === i0) continue;
                const d = dist(i0x, i0y, coords[2 * i], coords[2 * i + 1]);
                if (d < minDist && d > 0) {
                    i1 = i;
                    minDist = d;
                }
            }
            let i1x = coords[2 * i1];
            let i1y = coords[2 * i1 + 1];

            let minRadius = Infinity;

            // find the third point which forms the smallest circumcircle with the first two
            for (let i = 0; i < n; i++) {
                if (i === i0 || i === i1) continue;
                const r = circumradius(i0x, i0y, i1x, i1y, coords[2 * i], coords[2 * i + 1]);
                if (r < minRadius) {
                    i2 = i;
                    minRadius = r;
                }
            }
            let i2x = coords[2 * i2];
            let i2y = coords[2 * i2 + 1];

            if (minRadius === Infinity) {
                // order collinear points by dx (or dy if all x are identical)
                // and return the list as a hull
                for (let i = 0; i < n; i++) {
                    this._dists[i] = (coords[2 * i] - coords[0]) || (coords[2 * i + 1] - coords[1]);
                }
                quicksort(this._ids, this._dists, 0, n - 1);
                const hull = new Uint32Array(n);
                let j = 0;
                for (let i = 0, d0 = -Infinity; i < n; i++) {
                    const id = this._ids[i];
                    if (this._dists[id] > d0) {
                        hull[j++] = id;
                        d0 = this._dists[id];
                    }
                }
                this.hull = hull.subarray(0, j);
                this.triangles = new Uint32Array(0);
                this.halfedges = new Uint32Array(0);
                return;
            }

            // swap the order of the seed points for counter-clockwise orientation
            if (orient(i0x, i0y, i1x, i1y, i2x, i2y)) {
                const i = i1;
                const x = i1x;
                const y = i1y;
                i1 = i2;
                i1x = i2x;
                i1y = i2y;
                i2 = i;
                i2x = x;
                i2y = y;
            }

            const center = circumcenter(i0x, i0y, i1x, i1y, i2x, i2y);
            this._cx = center.x;
            this._cy = center.y;

            for (let i = 0; i < n; i++) {
                this._dists[i] = dist(coords[2 * i], coords[2 * i + 1], center.x, center.y);
            }

            // sort the points by distance from the seed triangle circumcenter
            quicksort(this._ids, this._dists, 0, n - 1);

            // set up the seed triangle as the starting hull
            this._hullStart = i0;
            let hullSize = 3;

            hullNext[i0] = hullPrev[i2] = i1;
            hullNext[i1] = hullPrev[i0] = i2;
            hullNext[i2] = hullPrev[i1] = i0;

            hullTri[i0] = 0;
            hullTri[i1] = 1;
            hullTri[i2] = 2;

            hullHash.fill(-1);
            hullHash[this._hashKey(i0x, i0y)] = i0;
            hullHash[this._hashKey(i1x, i1y)] = i1;
            hullHash[this._hashKey(i2x, i2y)] = i2;

            this.trianglesLen = 0;
            this._addTriangle(i0, i1, i2, -1, -1, -1);

            for (let k = 0, xp, yp; k < this._ids.length; k++) {
                const i = this._ids[k];
                const x = coords[2 * i];
                const y = coords[2 * i + 1];

                // skip near-duplicate points
                if (k > 0 && Math.abs(x - xp) <= EPSILON && Math.abs(y - yp) <= EPSILON) continue;
                xp = x;
                yp = y;

                // skip seed triangle points
                if (i === i0 || i === i1 || i === i2) continue;

                // find a visible edge on the convex hull using edge hash
                let start = 0;
                for (let j = 0, key = this._hashKey(x, y); j < this._hashSize; j++) {
                    start = hullHash[(key + j) % this._hashSize];
                    if (start !== -1 && start !== hullNext[start]) break;
                }

                start = hullPrev[start];
                let e = start, q;
                while (q = hullNext[e], !orient(x, y, coords[2 * e], coords[2 * e + 1], coords[2 * q], coords[2 * q + 1])) {
                    e = q;
                    if (e === start) {
                        e = -1;
                        break;
                    }
                }
                if (e === -1) continue; // likely a near-duplicate point; skip it

                // add the first triangle from the point
                let t = this._addTriangle(e, i, hullNext[e], -1, -1, hullTri[e]);

                // recursively flip triangles from the point until they satisfy the Delaunay condition
                hullTri[i] = this._legalize(t + 2);
                hullTri[e] = t; // keep track of boundary triangles on the hull
                hullSize++;

                // walk forward through the hull, adding more triangles and flipping recursively
                let n = hullNext[e];
                while (q = hullNext[n], orient(x, y, coords[2 * n], coords[2 * n + 1], coords[2 * q], coords[2 * q + 1])) {
                    t = this._addTriangle(n, i, q, hullTri[i], -1, hullTri[n]);
                    hullTri[i] = this._legalize(t + 2);
                    hullNext[n] = n; // mark as removed
                    hullSize--;
                    n = q;
                }

                // walk backward from the other side, adding more triangles and flipping
                if (e === start) {
                    while (q = hullPrev[e], orient(x, y, coords[2 * q], coords[2 * q + 1], coords[2 * e], coords[2 * e + 1])) {
                        t = this._addTriangle(q, i, e, -1, hullTri[e], hullTri[q]);
                        this._legalize(t + 2);
                        hullTri[q] = t;
                        hullNext[e] = e; // mark as removed
                        hullSize--;
                        e = q;
                    }
                }

                // update the hull indices
                this._hullStart = hullPrev[i] = e;
                hullNext[e] = hullPrev[n] = i;
                hullNext[i] = n;

                // save the two new edges in the hash table
                hullHash[this._hashKey(x, y)] = i;
                hullHash[this._hashKey(coords[2 * e], coords[2 * e + 1])] = e;
            }

            this.hull = new Uint32Array(hullSize);
            for (let i = 0, e = this._hullStart; i < hullSize; i++) {
                this.hull[i] = e;
                e = hullNext[e];
            }

            // trim typed triangle mesh arrays
            this.triangles = this._triangles.subarray(0, this.trianglesLen);
            this.halfedges = this._halfedges.subarray(0, this.trianglesLen);
        }

        _hashKey(x, y) {
            return Math.floor(pseudoAngle(x - this._cx, y - this._cy) * this._hashSize) % this._hashSize;
        }

        _legalize(a) {
            const {_triangles: triangles, _halfedges: halfedges, coords} = this;

            let i = 0;
            let ar = 0;

            // recursion eliminated with a fixed-size stack
            while (true) {
                const b = halfedges[a];

                /* if the pair of triangles doesn't satisfy the Delaunay condition
                 * (p1 is inside the circumcircle of [p0, pl, pr]), flip them,
                 * then do the same check/flip recursively for the new pair of triangles
                 *
                 *           pl                    pl
                 *          /||\                  /  \
                 *       al/ || \bl            al/    \a
                 *        /  ||  \              /      \
                 *       /  a||b  \    flip    /___ar___\
                 *     p0\   ||   /p1   =>   p0\---bl---/p1
                 *        \  ||  /              \      /
                 *       ar\ || /br             b\    /br
                 *          \||/                  \  /
                 *           pr                    pr
                 */
                const a0 = a - a % 3;
                ar = a0 + (a + 2) % 3;

                if (b === -1) { // convex hull edge
                    if (i === 0) break;
                    a = EDGE_STACK[--i];
                    continue;
                }

                const b0 = b - b % 3;
                const al = a0 + (a + 1) % 3;
                const bl = b0 + (b + 2) % 3;

                const p0 = triangles[ar];
                const pr = triangles[a];
                const pl = triangles[al];
                const p1 = triangles[bl];

                const illegal = inCircle(
                    coords[2 * p0], coords[2 * p0 + 1],
                    coords[2 * pr], coords[2 * pr + 1],
                    coords[2 * pl], coords[2 * pl + 1],
                    coords[2 * p1], coords[2 * p1 + 1]);

                if (illegal) {
                    triangles[a] = p1;
                    triangles[b] = p0;

                    const hbl = halfedges[bl];

                    // edge swapped on the other side of the hull (rare); fix the halfedge reference
                    if (hbl === -1) {
                        let e = this._hullStart;
                        do {
                            if (this._hullTri[e] === bl) {
                                this._hullTri[e] = a;
                                break;
                            }
                            e = this._hullPrev[e];
                        } while (e !== this._hullStart);
                    }
                    this._link(a, hbl);
                    this._link(b, halfedges[ar]);
                    this._link(ar, bl);

                    const br = b0 + (b + 1) % 3;

                    // don't worry about hitting the cap: it can only happen on extremely degenerate input
                    if (i < EDGE_STACK.length) {
                        EDGE_STACK[i++] = br;
                    }
                } else {
                    if (i === 0) break;
                    a = EDGE_STACK[--i];
                }
            }

            return ar;
        }

        _link(a, b) {
            this._halfedges[a] = b;
            if (b !== -1) this._halfedges[b] = a;
        }

        // add a new triangle given vertex indices and adjacent half-edge ids
        _addTriangle(i0, i1, i2, a, b, c) {
            const t = this.trianglesLen;

            this._triangles[t] = i0;
            this._triangles[t + 1] = i1;
            this._triangles[t + 2] = i2;

            this._link(t, a);
            this._link(t + 1, b);
            this._link(t + 2, c);

            this.trianglesLen += 3;

            return t;
        }
    }

    // monotonically increases with real angle, but doesn't need expensive trigonometry
    function pseudoAngle(dx, dy) {
        const p = dx / (Math.abs(dx) + Math.abs(dy));
        return (dy > 0 ? 3 - p : 1 + p) / 4; // [0..1]
    }

    function dist(ax, ay, bx, by) {
        const dx = ax - bx;
        const dy = ay - by;
        return dx * dx + dy * dy;
    }

    // return 2d orientation sign if we're confident in it through J. Shewchuk's error bound check
    function orientIfSure(px, py, rx, ry, qx, qy) {
        const l = (ry - py) * (qx - px);
        const r = (rx - px) * (qy - py);
        return Math.abs(l - r) >= 3.3306690738754716e-16 * Math.abs(l + r) ? l - r : 0;
    }

    // a more robust orientation test that's stable in a given triangle (to fix robustness issues)
    function orient(rx, ry, qx, qy, px, py) {
        const sign = orientIfSure(px, py, rx, ry, qx, qy) ||
        orientIfSure(rx, ry, qx, qy, px, py) ||
        orientIfSure(qx, qy, px, py, rx, ry);
        return sign < 0;
    }

    function inCircle(ax, ay, bx, by, cx, cy, px, py) {
        const dx = ax - px;
        const dy = ay - py;
        const ex = bx - px;
        const ey = by - py;
        const fx = cx - px;
        const fy = cy - py;

        const ap = dx * dx + dy * dy;
        const bp = ex * ex + ey * ey;
        const cp = fx * fx + fy * fy;

        return dx * (ey * cp - bp * fy) -
               dy * (ex * cp - bp * fx) +
               ap * (ex * fy - ey * fx) < 0;
    }

    function circumradius(ax, ay, bx, by, cx, cy) {
        const dx = bx - ax;
        const dy = by - ay;
        const ex = cx - ax;
        const ey = cy - ay;

        const bl = dx * dx + dy * dy;
        const cl = ex * ex + ey * ey;
        const d = 0.5 / (dx * ey - dy * ex);

        const x = (ey * bl - dy * cl) * d;
        const y = (dx * cl - ex * bl) * d;

        return x * x + y * y;
    }

    function circumcenter(ax, ay, bx, by, cx, cy) {
        const dx = bx - ax;
        const dy = by - ay;
        const ex = cx - ax;
        const ey = cy - ay;

        const bl = dx * dx + dy * dy;
        const cl = ex * ex + ey * ey;
        const d = 0.5 / (dx * ey - dy * ex);

        const x = ax + (ey * bl - dy * cl) * d;
        const y = ay + (dx * cl - ex * bl) * d;

        return {x, y};
    }

    function quicksort(ids, dists, left, right) {
        if (right - left <= 20) {
            for (let i = left + 1; i <= right; i++) {
                const temp = ids[i];
                const tempDist = dists[temp];
                let j = i - 1;
                while (j >= left && dists[ids[j]] > tempDist) ids[j + 1] = ids[j--];
                ids[j + 1] = temp;
            }
        } else {
            const median = (left + right) >> 1;
            let i = left + 1;
            let j = right;
            swap(ids, median, i);
            if (dists[ids[left]] > dists[ids[right]]) swap(ids, left, right);
            if (dists[ids[i]] > dists[ids[right]]) swap(ids, i, right);
            if (dists[ids[left]] > dists[ids[i]]) swap(ids, left, i);

            const temp = ids[i];
            const tempDist = dists[temp];
            while (true) {
                do i++; while (dists[ids[i]] < tempDist);
                do j--; while (dists[ids[j]] > tempDist);
                if (j < i) break;
                swap(ids, i, j);
            }
            ids[left + 1] = ids[j];
            ids[j] = temp;

            if (right - i + 1 >= j - left) {
                quicksort(ids, dists, i, right);
                quicksort(ids, dists, left, j - 1);
            } else {
                quicksort(ids, dists, left, j - 1);
                quicksort(ids, dists, i, right);
            }
        }
    }

    function swap(arr, i, j) {
        const tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }

    function defaultGetX(p) {
        return p[0];
    }
    function defaultGetY(p) {
        return p[1];
    }

    const epsilon$1 = 1e-6;

    class Path$1 {
      constructor() {
        this._x0 = this._y0 = // start of current subpath
        this._x1 = this._y1 = null; // end of current subpath
        this._ = "";
      }
      moveTo(x, y) {
        this._ += `M${this._x0 = this._x1 = +x},${this._y0 = this._y1 = +y}`;
      }
      closePath() {
        if (this._x1 !== null) {
          this._x1 = this._x0, this._y1 = this._y0;
          this._ += "Z";
        }
      }
      lineTo(x, y) {
        this._ += `L${this._x1 = +x},${this._y1 = +y}`;
      }
      arc(x, y, r) {
        x = +x, y = +y, r = +r;
        const x0 = x + r;
        const y0 = y;
        if (r < 0) throw new Error("negative radius");
        if (this._x1 === null) this._ += `M${x0},${y0}`;
        else if (Math.abs(this._x1 - x0) > epsilon$1 || Math.abs(this._y1 - y0) > epsilon$1) this._ += "L" + x0 + "," + y0;
        if (!r) return;
        this._ += `A${r},${r},0,1,1,${x - r},${y}A${r},${r},0,1,1,${this._x1 = x0},${this._y1 = y0}`;
      }
      rect(x, y, w, h) {
        this._ += `M${this._x0 = this._x1 = +x},${this._y0 = this._y1 = +y}h${+w}v${+h}h${-w}Z`;
      }
      value() {
        return this._ || null;
      }
    }

    class Polygon {
      constructor() {
        this._ = [];
      }
      moveTo(x, y) {
        this._.push([x, y]);
      }
      closePath() {
        this._.push(this._[0].slice());
      }
      lineTo(x, y) {
        this._.push([x, y]);
      }
      value() {
        return this._.length ? this._ : null;
      }
    }

    class Voronoi {
      constructor(delaunay, [xmin, ymin, xmax, ymax] = [0, 0, 960, 500]) {
        if (!((xmax = +xmax) >= (xmin = +xmin)) || !((ymax = +ymax) >= (ymin = +ymin))) throw new Error("invalid bounds");
        this.delaunay = delaunay;
        this._circumcenters = new Float64Array(delaunay.points.length * 2);
        this.vectors = new Float64Array(delaunay.points.length * 2);
        this.xmax = xmax, this.xmin = xmin;
        this.ymax = ymax, this.ymin = ymin;
        this._init();
      }
      update() {
        this.delaunay.update();
        this._init();
        return this;
      }
      _init() {
        const {delaunay: {points, hull, triangles}, vectors} = this;

        // Compute circumcenters.
        const circumcenters = this.circumcenters = this._circumcenters.subarray(0, triangles.length / 3 * 2);
        for (let i = 0, j = 0, n = triangles.length, x, y; i < n; i += 3, j += 2) {
          const t1 = triangles[i] * 2;
          const t2 = triangles[i + 1] * 2;
          const t3 = triangles[i + 2] * 2;
          const x1 = points[t1];
          const y1 = points[t1 + 1];
          const x2 = points[t2];
          const y2 = points[t2 + 1];
          const x3 = points[t3];
          const y3 = points[t3 + 1];

          const dx = x2 - x1;
          const dy = y2 - y1;
          const ex = x3 - x1;
          const ey = y3 - y1;
          const bl = dx * dx + dy * dy;
          const cl = ex * ex + ey * ey;
          const ab = (dx * ey - dy * ex) * 2;

          if (!ab) {
            // degenerate case (collinear diagram)
            x = (x1 + x3) / 2 - 1e8 * ey;
            y = (y1 + y3) / 2 + 1e8 * ex;
          }
          else if (Math.abs(ab) < 1e-8) {
            // almost equal points (degenerate triangle)
            x = (x1 + x3) / 2;
            y = (y1 + y3) / 2;
          } else {
            const d = 1 / ab;
            x = x1 + (ey * bl - dy * cl) * d;
            y = y1 + (dx * cl - ex * bl) * d;
          }
          circumcenters[j] = x;
          circumcenters[j + 1] = y;
        }

        // Compute exterior cell rays.
        let h = hull[hull.length - 1];
        let p0, p1 = h * 4;
        let x0, x1 = points[2 * h];
        let y0, y1 = points[2 * h + 1];
        vectors.fill(0);
        for (let i = 0; i < hull.length; ++i) {
          h = hull[i];
          p0 = p1, x0 = x1, y0 = y1;
          p1 = h * 4, x1 = points[2 * h], y1 = points[2 * h + 1];
          vectors[p0 + 2] = vectors[p1] = y0 - y1;
          vectors[p0 + 3] = vectors[p1 + 1] = x1 - x0;
        }
      }
      render(context) {
        const buffer = context == null ? context = new Path$1 : undefined;
        const {delaunay: {halfedges, inedges, hull}, circumcenters, vectors} = this;
        if (hull.length <= 1) return null;
        for (let i = 0, n = halfedges.length; i < n; ++i) {
          const j = halfedges[i];
          if (j < i) continue;
          const ti = Math.floor(i / 3) * 2;
          const tj = Math.floor(j / 3) * 2;
          const xi = circumcenters[ti];
          const yi = circumcenters[ti + 1];
          const xj = circumcenters[tj];
          const yj = circumcenters[tj + 1];
          this._renderSegment(xi, yi, xj, yj, context);
        }
        let h0, h1 = hull[hull.length - 1];
        for (let i = 0; i < hull.length; ++i) {
          h0 = h1, h1 = hull[i];
          const t = Math.floor(inedges[h1] / 3) * 2;
          const x = circumcenters[t];
          const y = circumcenters[t + 1];
          const v = h0 * 4;
          const p = this._project(x, y, vectors[v + 2], vectors[v + 3]);
          if (p) this._renderSegment(x, y, p[0], p[1], context);
        }
        return buffer && buffer.value();
      }
      renderBounds(context) {
        const buffer = context == null ? context = new Path$1 : undefined;
        context.rect(this.xmin, this.ymin, this.xmax - this.xmin, this.ymax - this.ymin);
        return buffer && buffer.value();
      }
      renderCell(i, context) {
        const buffer = context == null ? context = new Path$1 : undefined;
        const points = this._clip(i);
        if (points === null || !points.length) return;
        context.moveTo(points[0], points[1]);
        let n = points.length;
        while (points[0] === points[n-2] && points[1] === points[n-1] && n > 1) n -= 2;
        for (let i = 2; i < n; i += 2) {
          if (points[i] !== points[i-2] || points[i+1] !== points[i-1])
            context.lineTo(points[i], points[i + 1]);
        }
        context.closePath();
        return buffer && buffer.value();
      }
      *cellPolygons() {
        const {delaunay: {points}} = this;
        for (let i = 0, n = points.length / 2; i < n; ++i) {
          const cell = this.cellPolygon(i);
          if (cell) cell.index = i, yield cell;
        }
      }
      cellPolygon(i) {
        const polygon = new Polygon;
        this.renderCell(i, polygon);
        return polygon.value();
      }
      _renderSegment(x0, y0, x1, y1, context) {
        let S;
        const c0 = this._regioncode(x0, y0);
        const c1 = this._regioncode(x1, y1);
        if (c0 === 0 && c1 === 0) {
          context.moveTo(x0, y0);
          context.lineTo(x1, y1);
        } else if (S = this._clipSegment(x0, y0, x1, y1, c0, c1)) {
          context.moveTo(S[0], S[1]);
          context.lineTo(S[2], S[3]);
        }
      }
      contains(i, x, y) {
        if ((x = +x, x !== x) || (y = +y, y !== y)) return false;
        return this.delaunay._step(i, x, y) === i;
      }
      *neighbors(i) {
        const ci = this._clip(i);
        if (ci) for (const j of this.delaunay.neighbors(i)) {
          const cj = this._clip(j);
          // find the common edge
          if (cj) loop: for (let ai = 0, li = ci.length; ai < li; ai += 2) {
            for (let aj = 0, lj = cj.length; aj < lj; aj += 2) {
              if (ci[ai] == cj[aj]
              && ci[ai + 1] == cj[aj + 1]
              && ci[(ai + 2) % li] == cj[(aj + lj - 2) % lj]
              && ci[(ai + 3) % li] == cj[(aj + lj - 1) % lj]
              ) {
                yield j;
                break loop;
              }
            }
          }
        }
      }
      _cell(i) {
        const {circumcenters, delaunay: {inedges, halfedges, triangles}} = this;
        const e0 = inedges[i];
        if (e0 === -1) return null; // coincident point
        const points = [];
        let e = e0;
        do {
          const t = Math.floor(e / 3);
          points.push(circumcenters[t * 2], circumcenters[t * 2 + 1]);
          e = e % 3 === 2 ? e - 2 : e + 1;
          if (triangles[e] !== i) break; // bad triangulation
          e = halfedges[e];
        } while (e !== e0 && e !== -1);
        return points;
      }
      _clip(i) {
        // degenerate case (1 valid point: return the box)
        if (i === 0 && this.delaunay.hull.length === 1) {
          return [this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax, this.xmin, this.ymin];
        }
        const points = this._cell(i);
        if (points === null) return null;
        const {vectors: V} = this;
        const v = i * 4;
        return V[v] || V[v + 1]
            ? this._clipInfinite(i, points, V[v], V[v + 1], V[v + 2], V[v + 3])
            : this._clipFinite(i, points);
      }
      _clipFinite(i, points) {
        const n = points.length;
        let P = null;
        let x0, y0, x1 = points[n - 2], y1 = points[n - 1];
        let c0, c1 = this._regioncode(x1, y1);
        let e0, e1;
        for (let j = 0; j < n; j += 2) {
          x0 = x1, y0 = y1, x1 = points[j], y1 = points[j + 1];
          c0 = c1, c1 = this._regioncode(x1, y1);
          if (c0 === 0 && c1 === 0) {
            e0 = e1, e1 = 0;
            if (P) P.push(x1, y1);
            else P = [x1, y1];
          } else {
            let S, sx0, sy0, sx1, sy1;
            if (c0 === 0) {
              if ((S = this._clipSegment(x0, y0, x1, y1, c0, c1)) === null) continue;
              [sx0, sy0, sx1, sy1] = S;
            } else {
              if ((S = this._clipSegment(x1, y1, x0, y0, c1, c0)) === null) continue;
              [sx1, sy1, sx0, sy0] = S;
              e0 = e1, e1 = this._edgecode(sx0, sy0);
              if (e0 && e1) this._edge(i, e0, e1, P, P.length);
              if (P) P.push(sx0, sy0);
              else P = [sx0, sy0];
            }
            e0 = e1, e1 = this._edgecode(sx1, sy1);
            if (e0 && e1) this._edge(i, e0, e1, P, P.length);
            if (P) P.push(sx1, sy1);
            else P = [sx1, sy1];
          }
        }
        if (P) {
          e0 = e1, e1 = this._edgecode(P[0], P[1]);
          if (e0 && e1) this._edge(i, e0, e1, P, P.length);
        } else if (this.contains(i, (this.xmin + this.xmax) / 2, (this.ymin + this.ymax) / 2)) {
          return [this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax, this.xmin, this.ymin];
        }
        return P;
      }
      _clipSegment(x0, y0, x1, y1, c0, c1) {
        while (true) {
          if (c0 === 0 && c1 === 0) return [x0, y0, x1, y1];
          if (c0 & c1) return null;
          let x, y, c = c0 || c1;
          if (c & 0b1000) x = x0 + (x1 - x0) * (this.ymax - y0) / (y1 - y0), y = this.ymax;
          else if (c & 0b0100) x = x0 + (x1 - x0) * (this.ymin - y0) / (y1 - y0), y = this.ymin;
          else if (c & 0b0010) y = y0 + (y1 - y0) * (this.xmax - x0) / (x1 - x0), x = this.xmax;
          else y = y0 + (y1 - y0) * (this.xmin - x0) / (x1 - x0), x = this.xmin;
          if (c0) x0 = x, y0 = y, c0 = this._regioncode(x0, y0);
          else x1 = x, y1 = y, c1 = this._regioncode(x1, y1);
        }
      }
      _clipInfinite(i, points, vx0, vy0, vxn, vyn) {
        let P = Array.from(points), p;
        if (p = this._project(P[0], P[1], vx0, vy0)) P.unshift(p[0], p[1]);
        if (p = this._project(P[P.length - 2], P[P.length - 1], vxn, vyn)) P.push(p[0], p[1]);
        if (P = this._clipFinite(i, P)) {
          for (let j = 0, n = P.length, c0, c1 = this._edgecode(P[n - 2], P[n - 1]); j < n; j += 2) {
            c0 = c1, c1 = this._edgecode(P[j], P[j + 1]);
            if (c0 && c1) j = this._edge(i, c0, c1, P, j), n = P.length;
          }
        } else if (this.contains(i, (this.xmin + this.xmax) / 2, (this.ymin + this.ymax) / 2)) {
          P = [this.xmin, this.ymin, this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax];
        }
        return P;
      }
      _edge(i, e0, e1, P, j) {
        while (e0 !== e1) {
          let x, y;
          switch (e0) {
            case 0b0101: e0 = 0b0100; continue; // top-left
            case 0b0100: e0 = 0b0110, x = this.xmax, y = this.ymin; break; // top
            case 0b0110: e0 = 0b0010; continue; // top-right
            case 0b0010: e0 = 0b1010, x = this.xmax, y = this.ymax; break; // right
            case 0b1010: e0 = 0b1000; continue; // bottom-right
            case 0b1000: e0 = 0b1001, x = this.xmin, y = this.ymax; break; // bottom
            case 0b1001: e0 = 0b0001; continue; // bottom-left
            case 0b0001: e0 = 0b0101, x = this.xmin, y = this.ymin; break; // left
          }
          if ((P[j] !== x || P[j + 1] !== y) && this.contains(i, x, y)) {
            P.splice(j, 0, x, y), j += 2;
          }
        }
        if (P.length > 4) {
          for (let i = 0; i < P.length; i+= 2) {
            const j = (i + 2) % P.length, k = (i + 4) % P.length;
            if (P[i] === P[j] && P[j] === P[k]
            || P[i + 1] === P[j + 1] && P[j + 1] === P[k + 1])
              P.splice(j, 2), i -= 2;
          }
        }
        return j;
      }
      _project(x0, y0, vx, vy) {
        let t = Infinity, c, x, y;
        if (vy < 0) { // top
          if (y0 <= this.ymin) return null;
          if ((c = (this.ymin - y0) / vy) < t) y = this.ymin, x = x0 + (t = c) * vx;
        } else if (vy > 0) { // bottom
          if (y0 >= this.ymax) return null;
          if ((c = (this.ymax - y0) / vy) < t) y = this.ymax, x = x0 + (t = c) * vx;
        }
        if (vx > 0) { // right
          if (x0 >= this.xmax) return null;
          if ((c = (this.xmax - x0) / vx) < t) x = this.xmax, y = y0 + (t = c) * vy;
        } else if (vx < 0) { // left
          if (x0 <= this.xmin) return null;
          if ((c = (this.xmin - x0) / vx) < t) x = this.xmin, y = y0 + (t = c) * vy;
        }
        return [x, y];
      }
      _edgecode(x, y) {
        return (x === this.xmin ? 0b0001
            : x === this.xmax ? 0b0010 : 0b0000)
            | (y === this.ymin ? 0b0100
            : y === this.ymax ? 0b1000 : 0b0000);
      }
      _regioncode(x, y) {
        return (x < this.xmin ? 0b0001
            : x > this.xmax ? 0b0010 : 0b0000)
            | (y < this.ymin ? 0b0100
            : y > this.ymax ? 0b1000 : 0b0000);
      }
    }

    const tau$1 = 2 * Math.PI, pow = Math.pow;

    function pointX(p) {
      return p[0];
    }

    function pointY(p) {
      return p[1];
    }

    // A triangulation is collinear if all its triangles have a non-null area
    function collinear(d) {
      const {triangles, coords} = d;
      for (let i = 0; i < triangles.length; i += 3) {
        const a = 2 * triangles[i],
              b = 2 * triangles[i + 1],
              c = 2 * triangles[i + 2],
              cross = (coords[c] - coords[a]) * (coords[b + 1] - coords[a + 1])
                    - (coords[b] - coords[a]) * (coords[c + 1] - coords[a + 1]);
        if (cross > 1e-10) return false;
      }
      return true;
    }

    function jitter(x, y, r) {
      return [x + Math.sin(x + y) * r, y + Math.cos(x - y) * r];
    }

    class Delaunay {
      static from(points, fx = pointX, fy = pointY, that) {
        return new Delaunay("length" in points
            ? flatArray(points, fx, fy, that)
            : Float64Array.from(flatIterable(points, fx, fy, that)));
      }
      constructor(points) {
        this._delaunator = new Delaunator(points);
        this.inedges = new Int32Array(points.length / 2);
        this._hullIndex = new Int32Array(points.length / 2);
        this.points = this._delaunator.coords;
        this._init();
      }
      update() {
        this._delaunator.update();
        this._init();
        return this;
      }
      _init() {
        const d = this._delaunator, points = this.points;

        // check for collinear
        if (d.hull && d.hull.length > 2 && collinear(d)) {
          this.collinear = Int32Array.from({length: points.length/2}, (_,i) => i)
            .sort((i, j) => points[2 * i] - points[2 * j] || points[2 * i + 1] - points[2 * j + 1]); // for exact neighbors
          const e = this.collinear[0], f = this.collinear[this.collinear.length - 1],
            bounds = [ points[2 * e], points[2 * e + 1], points[2 * f], points[2 * f + 1] ],
            r = 1e-8 * Math.hypot(bounds[3] - bounds[1], bounds[2] - bounds[0]);
          for (let i = 0, n = points.length / 2; i < n; ++i) {
            const p = jitter(points[2 * i], points[2 * i + 1], r);
            points[2 * i] = p[0];
            points[2 * i + 1] = p[1];
          }
          this._delaunator = new Delaunator(points);
        } else {
          delete this.collinear;
        }

        const halfedges = this.halfedges = this._delaunator.halfedges;
        const hull = this.hull = this._delaunator.hull;
        const triangles = this.triangles = this._delaunator.triangles;
        const inedges = this.inedges.fill(-1);
        const hullIndex = this._hullIndex.fill(-1);

        // Compute an index from each point to an (arbitrary) incoming halfedge
        // Used to give the first neighbor of each point; for this reason,
        // on the hull we give priority to exterior halfedges
        for (let e = 0, n = halfedges.length; e < n; ++e) {
          const p = triangles[e % 3 === 2 ? e - 2 : e + 1];
          if (halfedges[e] === -1 || inedges[p] === -1) inedges[p] = e;
        }
        for (let i = 0, n = hull.length; i < n; ++i) {
          hullIndex[hull[i]] = i;
        }

        // degenerate case: 1 or 2 (distinct) points
        if (hull.length <= 2 && hull.length > 0) {
          this.triangles = new Int32Array(3).fill(-1);
          this.halfedges = new Int32Array(3).fill(-1);
          this.triangles[0] = hull[0];
          this.triangles[1] = hull[1];
          this.triangles[2] = hull[1];
          inedges[hull[0]] = 1;
          if (hull.length === 2) inedges[hull[1]] = 0;
        }
      }
      voronoi(bounds) {
        return new Voronoi(this, bounds);
      }
      *neighbors(i) {
        const {inedges, hull, _hullIndex, halfedges, triangles, collinear} = this;

        // degenerate case with several collinear points
        if (collinear) {
          const l = collinear.indexOf(i);
          if (l > 0) yield collinear[l - 1];
          if (l < collinear.length - 1) yield collinear[l + 1];
          return;
        }

        const e0 = inedges[i];
        if (e0 === -1) return; // coincident point
        let e = e0, p0 = -1;
        do {
          yield p0 = triangles[e];
          e = e % 3 === 2 ? e - 2 : e + 1;
          if (triangles[e] !== i) return; // bad triangulation
          e = halfedges[e];
          if (e === -1) {
            const p = hull[(_hullIndex[i] + 1) % hull.length];
            if (p !== p0) yield p;
            return;
          }
        } while (e !== e0);
      }
      find(x, y, i = 0) {
        if ((x = +x, x !== x) || (y = +y, y !== y)) return -1;
        const i0 = i;
        let c;
        while ((c = this._step(i, x, y)) >= 0 && c !== i && c !== i0) i = c;
        return c;
      }
      _step(i, x, y) {
        const {inedges, hull, _hullIndex, halfedges, triangles, points} = this;
        if (inedges[i] === -1 || !points.length) return (i + 1) % (points.length >> 1);
        let c = i;
        let dc = pow(x - points[i * 2], 2) + pow(y - points[i * 2 + 1], 2);
        const e0 = inedges[i];
        let e = e0;
        do {
          let t = triangles[e];
          const dt = pow(x - points[t * 2], 2) + pow(y - points[t * 2 + 1], 2);
          if (dt < dc) dc = dt, c = t;
          e = e % 3 === 2 ? e - 2 : e + 1;
          if (triangles[e] !== i) break; // bad triangulation
          e = halfedges[e];
          if (e === -1) {
            e = hull[(_hullIndex[i] + 1) % hull.length];
            if (e !== t) {
              if (pow(x - points[e * 2], 2) + pow(y - points[e * 2 + 1], 2) < dc) return e;
            }
            break;
          }
        } while (e !== e0);
        return c;
      }
      render(context) {
        const buffer = context == null ? context = new Path$1 : undefined;
        const {points, halfedges, triangles} = this;
        for (let i = 0, n = halfedges.length; i < n; ++i) {
          const j = halfedges[i];
          if (j < i) continue;
          const ti = triangles[i] * 2;
          const tj = triangles[j] * 2;
          context.moveTo(points[ti], points[ti + 1]);
          context.lineTo(points[tj], points[tj + 1]);
        }
        this.renderHull(context);
        return buffer && buffer.value();
      }
      renderPoints(context, r = 2) {
        const buffer = context == null ? context = new Path$1 : undefined;
        const {points} = this;
        for (let i = 0, n = points.length; i < n; i += 2) {
          const x = points[i], y = points[i + 1];
          context.moveTo(x + r, y);
          context.arc(x, y, r, 0, tau$1);
        }
        return buffer && buffer.value();
      }
      renderHull(context) {
        const buffer = context == null ? context = new Path$1 : undefined;
        const {hull, points} = this;
        const h = hull[0] * 2, n = hull.length;
        context.moveTo(points[h], points[h + 1]);
        for (let i = 1; i < n; ++i) {
          const h = 2 * hull[i];
          context.lineTo(points[h], points[h + 1]);
        }
        context.closePath();
        return buffer && buffer.value();
      }
      hullPolygon() {
        const polygon = new Polygon;
        this.renderHull(polygon);
        return polygon.value();
      }
      renderTriangle(i, context) {
        const buffer = context == null ? context = new Path$1 : undefined;
        const {points, triangles} = this;
        const t0 = triangles[i *= 3] * 2;
        const t1 = triangles[i + 1] * 2;
        const t2 = triangles[i + 2] * 2;
        context.moveTo(points[t0], points[t0 + 1]);
        context.lineTo(points[t1], points[t1 + 1]);
        context.lineTo(points[t2], points[t2 + 1]);
        context.closePath();
        return buffer && buffer.value();
      }
      *trianglePolygons() {
        const {triangles} = this;
        for (let i = 0, n = triangles.length / 3; i < n; ++i) {
          yield this.trianglePolygon(i);
        }
      }
      trianglePolygon(i) {
        const polygon = new Polygon;
        this.renderTriangle(i, polygon);
        return polygon.value();
      }
    }

    function flatArray(points, fx, fy, that) {
      const n = points.length;
      const array = new Float64Array(n * 2);
      for (let i = 0; i < n; ++i) {
        const p = points[i];
        array[i * 2] = fx.call(that, p, i, points);
        array[i * 2 + 1] = fy.call(that, p, i, points);
      }
      return array;
    }

    function* flatIterable(points, fx, fy, that) {
      let i = 0;
      for (const p of points) {
        yield fx.call(that, p, i, points);
        yield fy.call(that, p, i, points);
        ++i;
      }
    }

    /* src/components/charts/MiniVideo.svelte generated by Svelte v3.38.2 */

    // (16:0) {#if video}
    function create_if_block$2(ctx) {
    	let layer;
    	let current;

    	layer = new Layer({
    			props: { render: /*render*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(layer.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(layer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const layer_changes = {};
    			if (dirty & /*render*/ 2) layer_changes.render = /*render*/ ctx[1];
    			layer.$set(layer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(layer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(layer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(layer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(16:0) {#if video}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*video*/ ctx[0] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*video*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*video*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let render;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MiniVideo", slots, []);
    	let { x = 0 } = $$props;
    	let { y = 0 } = $$props;
    	let { size = 1 } = $$props;
    	let { currentTime } = $$props;
    	let { video } = $$props;
    	const writable_props = ["x", "y", "size", "currentTime", "video"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MiniVideo> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("x" in $$props) $$invalidate(2, x = $$props.x);
    		if ("y" in $$props) $$invalidate(3, y = $$props.y);
    		if ("size" in $$props) $$invalidate(4, size = $$props.size);
    		if ("currentTime" in $$props) $$invalidate(5, currentTime = $$props.currentTime);
    		if ("video" in $$props) $$invalidate(0, video = $$props.video);
    	};

    	$$self.$capture_state = () => ({
    		Layer,
    		x,
    		y,
    		size,
    		currentTime,
    		video,
    		render
    	});

    	$$self.$inject_state = $$props => {
    		if ("x" in $$props) $$invalidate(2, x = $$props.x);
    		if ("y" in $$props) $$invalidate(3, y = $$props.y);
    		if ("size" in $$props) $$invalidate(4, size = $$props.size);
    		if ("currentTime" in $$props) $$invalidate(5, currentTime = $$props.currentTime);
    		if ("video" in $$props) $$invalidate(0, video = $$props.video);
    		if ("render" in $$props) $$invalidate(1, render = $$props.render);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*currentTime, video, x, y, size*/ 61) {
    			$$invalidate(1, render = ({ context }) => {
    				context.drawImage(video, x, y, size * 0.625, size);
    			});
    		}
    	};

    	return [video, render, x, y, size, currentTime];
    }

    class MiniVideo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			x: 2,
    			y: 3,
    			size: 4,
    			currentTime: 5,
    			video: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MiniVideo",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*currentTime*/ ctx[5] === undefined && !("currentTime" in props)) {
    			console.warn("<MiniVideo> was created without expected prop 'currentTime'");
    		}

    		if (/*video*/ ctx[0] === undefined && !("video" in props)) {
    			console.warn("<MiniVideo> was created without expected prop 'video'");
    		}
    	}

    	get x() {
    		throw new Error("<MiniVideo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<MiniVideo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<MiniVideo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<MiniVideo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<MiniVideo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<MiniVideo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentTime() {
    		throw new Error("<MiniVideo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentTime(value) {
    		throw new Error("<MiniVideo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get video() {
    		throw new Error("<MiniVideo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set video(value) {
    		throw new Error("<MiniVideo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/charts/Scatter.svelte generated by Svelte v3.38.2 */
    const file$5 = "src/components/charts/Scatter.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	child_ctx[16] = i;
    	return child_ctx;
    }

    // (42:2) {#each data as d, i}
    function create_each_block$4(ctx) {
    	let minivideo;
    	let current;

    	minivideo = new MiniVideo({
    			props: {
    				x: /*d*/ ctx[14].x,
    				y: /*d*/ ctx[14].y,
    				size: /*d*/ ctx[14].r,
    				video: /*video*/ ctx[3],
    				currentTime: /*currentTime*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(minivideo.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(minivideo, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const minivideo_changes = {};
    			if (dirty & /*data*/ 1) minivideo_changes.x = /*d*/ ctx[14].x;
    			if (dirty & /*data*/ 1) minivideo_changes.y = /*d*/ ctx[14].y;
    			if (dirty & /*data*/ 1) minivideo_changes.size = /*d*/ ctx[14].r;
    			if (dirty & /*video*/ 8) minivideo_changes.video = /*video*/ ctx[3];
    			if (dirty & /*currentTime*/ 16) minivideo_changes.currentTime = /*currentTime*/ ctx[4];
    			minivideo.$set(minivideo_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(minivideo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(minivideo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(minivideo, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(42:2) {#each data as d, i}",
    		ctx
    	});

    	return block;
    }

    // (33:0) <Canvas   {width}   {height}   style="cursor: pointer"   on:mousemove={({ offsetX: x, offsetY: y }) => (picked = delaunay.find(x, y))}   on:mouseout={() => (picked = null)}   on:mousedown={() => (click = true)}   on:mouseup={() => (click = false)} >
    function create_default_slot(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data, video, currentTime*/ 25) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(33:0) <Canvas   {width}   {height}   style=\\\"cursor: pointer\\\"   on:mousemove={({ offsetX: x, offsetY: y }) => (picked = delaunay.find(x, y))}   on:mouseout={() => (picked = null)}   on:mousedown={() => (click = true)}   on:mouseup={() => (click = false)} >",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let video_1;
    	let video_1_src_value;
    	let video_1_updating = false;
    	let video_1_animationframe;
    	let t;
    	let canvas;
    	let current;
    	let mounted;
    	let dispose;

    	function video_1_timeupdate_handler() {
    		cancelAnimationFrame(video_1_animationframe);

    		if (!video_1.paused) {
    			video_1_animationframe = raf(video_1_timeupdate_handler);
    			video_1_updating = true;
    		}

    		/*video_1_timeupdate_handler*/ ctx[9].call(video_1);
    	}

    	canvas = new Canvas({
    			props: {
    				width: /*width*/ ctx[1],
    				height: /*height*/ ctx[2],
    				style: "cursor: pointer",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	canvas.$on("mousemove", /*mousemove_handler*/ ctx[10]);
    	canvas.$on("mouseout", /*mouseout_handler*/ ctx[11]);
    	canvas.$on("mousedown", /*mousedown_handler*/ ctx[12]);
    	canvas.$on("mouseup", /*mouseup_handler*/ ctx[13]);

    	const block = {
    		c: function create() {
    			video_1 = element("video");
    			t = space();
    			create_component(canvas.$$.fragment);
    			if (video_1.src !== (video_1_src_value = "./video/por.mp4")) attr_dev(video_1, "src", video_1_src_value);
    			attr_dev(video_1, "height", 60);
    			video_1.autoplay = true;
    			video_1.loop = true;
    			attr_dev(video_1, "class", "svelte-1wcu65t");
    			add_location(video_1, file$5, 23, 0, 404);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, video_1, anchor);
    			/*video_1_binding*/ ctx[8](video_1);
    			insert_dev(target, t, anchor);
    			mount_component(canvas, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(video_1, "timeupdate", video_1_timeupdate_handler);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!video_1_updating && dirty & /*currentTime*/ 16 && !isNaN(/*currentTime*/ ctx[4])) {
    				video_1.currentTime = /*currentTime*/ ctx[4];
    			}

    			video_1_updating = false;
    			const canvas_changes = {};
    			if (dirty & /*width*/ 2) canvas_changes.width = /*width*/ ctx[1];
    			if (dirty & /*height*/ 4) canvas_changes.height = /*height*/ ctx[2];

    			if (dirty & /*$$scope, data, video, currentTime*/ 131097) {
    				canvas_changes.$$scope = { dirty, ctx };
    			}

    			canvas.$set(canvas_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(canvas.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(canvas.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(video_1);
    			/*video_1_binding*/ ctx[8](null);
    			if (detaching) detach_dev(t);
    			destroy_component(canvas, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let delaunay;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Scatter", slots, []);
    	let { data } = $$props;
    	let { width } = $$props;
    	let { height } = $$props;
    	let video, currentTime;
    	let picked = null, click = false;
    	const writable_props = ["data", "width", "height"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Scatter> was created with unknown prop '${key}'`);
    	});

    	function video_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			video = $$value;
    			$$invalidate(3, video);
    		});
    	}

    	function video_1_timeupdate_handler() {
    		currentTime = this.currentTime;
    		$$invalidate(4, currentTime);
    	}

    	const mousemove_handler = ({ offsetX: x, offsetY: y }) => $$invalidate(5, picked = delaunay.find(x, y));
    	const mouseout_handler = () => $$invalidate(5, picked = null);
    	const mousedown_handler = () => $$invalidate(6, click = true);
    	const mouseup_handler = () => $$invalidate(6, click = false);

    	$$self.$$set = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("height" in $$props) $$invalidate(2, height = $$props.height);
    	};

    	$$self.$capture_state = () => ({
    		Canvas,
    		Delaunay,
    		MiniVideo,
    		data,
    		width,
    		height,
    		video,
    		currentTime,
    		picked,
    		click,
    		delaunay
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(0, data = $$props.data);
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("height" in $$props) $$invalidate(2, height = $$props.height);
    		if ("video" in $$props) $$invalidate(3, video = $$props.video);
    		if ("currentTime" in $$props) $$invalidate(4, currentTime = $$props.currentTime);
    		if ("picked" in $$props) $$invalidate(5, picked = $$props.picked);
    		if ("click" in $$props) $$invalidate(6, click = $$props.click);
    		if ("delaunay" in $$props) $$invalidate(7, delaunay = $$props.delaunay);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data*/ 1) {
    			$$invalidate(7, delaunay = Delaunay.from(data, d => d.x, d => d.y));
    		}
    	};

    	return [
    		data,
    		width,
    		height,
    		video,
    		currentTime,
    		picked,
    		click,
    		delaunay,
    		video_1_binding,
    		video_1_timeupdate_handler,
    		mousemove_handler,
    		mouseout_handler,
    		mousedown_handler,
    		mouseup_handler
    	];
    }

    class Scatter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { data: 0, width: 1, height: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Scatter",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !("data" in props)) {
    			console.warn("<Scatter> was created without expected prop 'data'");
    		}

    		if (/*width*/ ctx[1] === undefined && !("width" in props)) {
    			console.warn("<Scatter> was created without expected prop 'width'");
    		}

    		if (/*height*/ ctx[2] === undefined && !("height" in props)) {
    			console.warn("<Scatter> was created without expected prop 'height'");
    		}
    	}

    	get data() {
    		throw new Error("<Scatter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Scatter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Scatter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Scatter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Scatter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Scatter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function ascending(a, b) {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }

    function bisector(f) {
      let delta = f;
      let compare = f;

      if (f.length === 1) {
        delta = (d, x) => f(d) - x;
        compare = ascendingComparator(f);
      }

      function left(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        while (lo < hi) {
          const mid = (lo + hi) >>> 1;
          if (compare(a[mid], x) < 0) lo = mid + 1;
          else hi = mid;
        }
        return lo;
      }

      function right(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        while (lo < hi) {
          const mid = (lo + hi) >>> 1;
          if (compare(a[mid], x) > 0) hi = mid;
          else lo = mid + 1;
        }
        return lo;
      }

      function center(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        const i = left(a, x, lo, hi - 1);
        return i > lo && delta(a[i - 1], x) > -delta(a[i], x) ? i - 1 : i;
      }

      return {left, center, right};
    }

    function ascendingComparator(f) {
      return (d, x) => ascending(f(d), x);
    }

    function number$1(x) {
      return x === null ? NaN : +x;
    }

    const ascendingBisect = bisector(ascending);
    const bisectRight = ascendingBisect.right;
    bisector(number$1).center;

    function extent(values, valueof) {
      let min;
      let max;
      if (valueof === undefined) {
        for (const value of values) {
          if (value != null) {
            if (min === undefined) {
              if (value >= value) min = max = value;
            } else {
              if (min > value) min = value;
              if (max < value) max = value;
            }
          }
        }
      } else {
        let index = -1;
        for (let value of values) {
          if ((value = valueof(value, ++index, values)) != null) {
            if (min === undefined) {
              if (value >= value) min = max = value;
            } else {
              if (min > value) min = value;
              if (max < value) max = value;
            }
          }
        }
      }
      return [min, max];
    }

    class InternMap extends Map {
      constructor(entries, key = keyof) {
        super();
        Object.defineProperties(this, {_intern: {value: new Map()}, _key: {value: key}});
        if (entries != null) for (const [key, value] of entries) this.set(key, value);
      }
      get(key) {
        return super.get(intern_get(this, key));
      }
      has(key) {
        return super.has(intern_get(this, key));
      }
      set(key, value) {
        return super.set(intern_set(this, key), value);
      }
      delete(key) {
        return super.delete(intern_delete(this, key));
      }
    }

    function intern_get({_intern, _key}, value) {
      const key = _key(value);
      return _intern.has(key) ? _intern.get(key) : value;
    }

    function intern_set({_intern, _key}, value) {
      const key = _key(value);
      if (_intern.has(key)) return _intern.get(key);
      _intern.set(key, value);
      return value;
    }

    function intern_delete({_intern, _key}, value) {
      const key = _key(value);
      if (_intern.has(key)) {
        value = _intern.get(value);
        _intern.delete(key);
      }
      return value;
    }

    function keyof(value) {
      return value !== null && typeof value === "object" ? value.valueOf() : value;
    }

    function identity$2(x) {
      return x;
    }

    function group(values, ...keys) {
      return nest(values, identity$2, identity$2, keys);
    }

    function nest(values, map, reduce, keys) {
      return (function regroup(values, i) {
        if (i >= keys.length) return reduce(values);
        const groups = new InternMap();
        const keyof = keys[i++];
        let index = -1;
        for (const value of values) {
          const key = keyof(value, ++index, values);
          const group = groups.get(key);
          if (group) group.push(value);
          else groups.set(key, [value]);
        }
        for (const [key, values] of groups) {
          groups.set(key, regroup(values, i));
        }
        return map(groups);
      })(values, 0);
    }

    var e10 = Math.sqrt(50),
        e5 = Math.sqrt(10),
        e2 = Math.sqrt(2);

    function ticks(start, stop, count) {
      var reverse,
          i = -1,
          n,
          ticks,
          step;

      stop = +stop, start = +start, count = +count;
      if (start === stop && count > 0) return [start];
      if (reverse = stop < start) n = start, start = stop, stop = n;
      if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

      if (step > 0) {
        let r0 = Math.round(start / step), r1 = Math.round(stop / step);
        if (r0 * step < start) ++r0;
        if (r1 * step > stop) --r1;
        ticks = new Array(n = r1 - r0 + 1);
        while (++i < n) ticks[i] = (r0 + i) * step;
      } else {
        step = -step;
        let r0 = Math.round(start * step), r1 = Math.round(stop * step);
        if (r0 / step < start) ++r0;
        if (r1 / step > stop) --r1;
        ticks = new Array(n = r1 - r0 + 1);
        while (++i < n) ticks[i] = (r0 + i) / step;
      }

      if (reverse) ticks.reverse();

      return ticks;
    }

    function tickIncrement(start, stop, count) {
      var step = (stop - start) / Math.max(0, count),
          power = Math.floor(Math.log(step) / Math.LN10),
          error = step / Math.pow(10, power);
      return power >= 0
          ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
          : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
    }

    function tickStep(start, stop, count) {
      var step0 = Math.abs(stop - start) / Math.max(0, count),
          step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
          error = step0 / step1;
      if (error >= e10) step1 *= 10;
      else if (error >= e5) step1 *= 5;
      else if (error >= e2) step1 *= 2;
      return stop < start ? -step1 : step1;
    }

    function initRange(domain, range) {
      switch (arguments.length) {
        case 0: break;
        case 1: this.range(domain); break;
        default: this.range(range).domain(domain); break;
      }
      return this;
    }

    const implicit = Symbol("implicit");

    function ordinal() {
      var index = new Map(),
          domain = [],
          range = [],
          unknown = implicit;

      function scale(d) {
        var key = d + "", i = index.get(key);
        if (!i) {
          if (unknown !== implicit) return unknown;
          index.set(key, i = domain.push(d));
        }
        return range[(i - 1) % range.length];
      }

      scale.domain = function(_) {
        if (!arguments.length) return domain.slice();
        domain = [], index = new Map();
        for (const value of _) {
          const key = value + "";
          if (index.has(key)) continue;
          index.set(key, domain.push(value));
        }
        return scale;
      };

      scale.range = function(_) {
        return arguments.length ? (range = Array.from(_), scale) : range.slice();
      };

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
      };

      scale.copy = function() {
        return ordinal(domain, range).unknown(unknown);
      };

      initRange.apply(scale, arguments);

      return scale;
    }

    function define(constructor, factory, prototype) {
      constructor.prototype = factory.prototype = prototype;
      prototype.constructor = constructor;
    }

    function extend(parent, definition) {
      var prototype = Object.create(parent.prototype);
      for (var key in definition) prototype[key] = definition[key];
      return prototype;
    }

    function Color() {}

    var darker = 0.7;
    var brighter = 1 / darker;

    var reI = "\\s*([+-]?\\d+)\\s*",
        reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
        reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
        reHex = /^#([0-9a-f]{3,8})$/,
        reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
        reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
        reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
        reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
        reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
        reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

    var named = {
      aliceblue: 0xf0f8ff,
      antiquewhite: 0xfaebd7,
      aqua: 0x00ffff,
      aquamarine: 0x7fffd4,
      azure: 0xf0ffff,
      beige: 0xf5f5dc,
      bisque: 0xffe4c4,
      black: 0x000000,
      blanchedalmond: 0xffebcd,
      blue: 0x0000ff,
      blueviolet: 0x8a2be2,
      brown: 0xa52a2a,
      burlywood: 0xdeb887,
      cadetblue: 0x5f9ea0,
      chartreuse: 0x7fff00,
      chocolate: 0xd2691e,
      coral: 0xff7f50,
      cornflowerblue: 0x6495ed,
      cornsilk: 0xfff8dc,
      crimson: 0xdc143c,
      cyan: 0x00ffff,
      darkblue: 0x00008b,
      darkcyan: 0x008b8b,
      darkgoldenrod: 0xb8860b,
      darkgray: 0xa9a9a9,
      darkgreen: 0x006400,
      darkgrey: 0xa9a9a9,
      darkkhaki: 0xbdb76b,
      darkmagenta: 0x8b008b,
      darkolivegreen: 0x556b2f,
      darkorange: 0xff8c00,
      darkorchid: 0x9932cc,
      darkred: 0x8b0000,
      darksalmon: 0xe9967a,
      darkseagreen: 0x8fbc8f,
      darkslateblue: 0x483d8b,
      darkslategray: 0x2f4f4f,
      darkslategrey: 0x2f4f4f,
      darkturquoise: 0x00ced1,
      darkviolet: 0x9400d3,
      deeppink: 0xff1493,
      deepskyblue: 0x00bfff,
      dimgray: 0x696969,
      dimgrey: 0x696969,
      dodgerblue: 0x1e90ff,
      firebrick: 0xb22222,
      floralwhite: 0xfffaf0,
      forestgreen: 0x228b22,
      fuchsia: 0xff00ff,
      gainsboro: 0xdcdcdc,
      ghostwhite: 0xf8f8ff,
      gold: 0xffd700,
      goldenrod: 0xdaa520,
      gray: 0x808080,
      green: 0x008000,
      greenyellow: 0xadff2f,
      grey: 0x808080,
      honeydew: 0xf0fff0,
      hotpink: 0xff69b4,
      indianred: 0xcd5c5c,
      indigo: 0x4b0082,
      ivory: 0xfffff0,
      khaki: 0xf0e68c,
      lavender: 0xe6e6fa,
      lavenderblush: 0xfff0f5,
      lawngreen: 0x7cfc00,
      lemonchiffon: 0xfffacd,
      lightblue: 0xadd8e6,
      lightcoral: 0xf08080,
      lightcyan: 0xe0ffff,
      lightgoldenrodyellow: 0xfafad2,
      lightgray: 0xd3d3d3,
      lightgreen: 0x90ee90,
      lightgrey: 0xd3d3d3,
      lightpink: 0xffb6c1,
      lightsalmon: 0xffa07a,
      lightseagreen: 0x20b2aa,
      lightskyblue: 0x87cefa,
      lightslategray: 0x778899,
      lightslategrey: 0x778899,
      lightsteelblue: 0xb0c4de,
      lightyellow: 0xffffe0,
      lime: 0x00ff00,
      limegreen: 0x32cd32,
      linen: 0xfaf0e6,
      magenta: 0xff00ff,
      maroon: 0x800000,
      mediumaquamarine: 0x66cdaa,
      mediumblue: 0x0000cd,
      mediumorchid: 0xba55d3,
      mediumpurple: 0x9370db,
      mediumseagreen: 0x3cb371,
      mediumslateblue: 0x7b68ee,
      mediumspringgreen: 0x00fa9a,
      mediumturquoise: 0x48d1cc,
      mediumvioletred: 0xc71585,
      midnightblue: 0x191970,
      mintcream: 0xf5fffa,
      mistyrose: 0xffe4e1,
      moccasin: 0xffe4b5,
      navajowhite: 0xffdead,
      navy: 0x000080,
      oldlace: 0xfdf5e6,
      olive: 0x808000,
      olivedrab: 0x6b8e23,
      orange: 0xffa500,
      orangered: 0xff4500,
      orchid: 0xda70d6,
      palegoldenrod: 0xeee8aa,
      palegreen: 0x98fb98,
      paleturquoise: 0xafeeee,
      palevioletred: 0xdb7093,
      papayawhip: 0xffefd5,
      peachpuff: 0xffdab9,
      peru: 0xcd853f,
      pink: 0xffc0cb,
      plum: 0xdda0dd,
      powderblue: 0xb0e0e6,
      purple: 0x800080,
      rebeccapurple: 0x663399,
      red: 0xff0000,
      rosybrown: 0xbc8f8f,
      royalblue: 0x4169e1,
      saddlebrown: 0x8b4513,
      salmon: 0xfa8072,
      sandybrown: 0xf4a460,
      seagreen: 0x2e8b57,
      seashell: 0xfff5ee,
      sienna: 0xa0522d,
      silver: 0xc0c0c0,
      skyblue: 0x87ceeb,
      slateblue: 0x6a5acd,
      slategray: 0x708090,
      slategrey: 0x708090,
      snow: 0xfffafa,
      springgreen: 0x00ff7f,
      steelblue: 0x4682b4,
      tan: 0xd2b48c,
      teal: 0x008080,
      thistle: 0xd8bfd8,
      tomato: 0xff6347,
      turquoise: 0x40e0d0,
      violet: 0xee82ee,
      wheat: 0xf5deb3,
      white: 0xffffff,
      whitesmoke: 0xf5f5f5,
      yellow: 0xffff00,
      yellowgreen: 0x9acd32
    };

    define(Color, color, {
      copy: function(channels) {
        return Object.assign(new this.constructor, this, channels);
      },
      displayable: function() {
        return this.rgb().displayable();
      },
      hex: color_formatHex, // Deprecated! Use color.formatHex.
      formatHex: color_formatHex,
      formatHsl: color_formatHsl,
      formatRgb: color_formatRgb,
      toString: color_formatRgb
    });

    function color_formatHex() {
      return this.rgb().formatHex();
    }

    function color_formatHsl() {
      return hslConvert(this).formatHsl();
    }

    function color_formatRgb() {
      return this.rgb().formatRgb();
    }

    function color(format) {
      var m, l;
      format = (format + "").trim().toLowerCase();
      return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
          : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
          : l === 8 ? rgba(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
          : l === 4 ? rgba((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
          : null) // invalid hex
          : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
          : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
          : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
          : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
          : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
          : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
          : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
          : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
          : null;
    }

    function rgbn(n) {
      return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
    }

    function rgba(r, g, b, a) {
      if (a <= 0) r = g = b = NaN;
      return new Rgb(r, g, b, a);
    }

    function rgbConvert(o) {
      if (!(o instanceof Color)) o = color(o);
      if (!o) return new Rgb;
      o = o.rgb();
      return new Rgb(o.r, o.g, o.b, o.opacity);
    }

    function rgb$1(r, g, b, opacity) {
      return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
    }

    function Rgb(r, g, b, opacity) {
      this.r = +r;
      this.g = +g;
      this.b = +b;
      this.opacity = +opacity;
    }

    define(Rgb, rgb$1, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      rgb: function() {
        return this;
      },
      displayable: function() {
        return (-0.5 <= this.r && this.r < 255.5)
            && (-0.5 <= this.g && this.g < 255.5)
            && (-0.5 <= this.b && this.b < 255.5)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      hex: rgb_formatHex, // Deprecated! Use color.formatHex.
      formatHex: rgb_formatHex,
      formatRgb: rgb_formatRgb,
      toString: rgb_formatRgb
    }));

    function rgb_formatHex() {
      return "#" + hex(this.r) + hex(this.g) + hex(this.b);
    }

    function rgb_formatRgb() {
      var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
      return (a === 1 ? "rgb(" : "rgba(")
          + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
          + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
          + Math.max(0, Math.min(255, Math.round(this.b) || 0))
          + (a === 1 ? ")" : ", " + a + ")");
    }

    function hex(value) {
      value = Math.max(0, Math.min(255, Math.round(value) || 0));
      return (value < 16 ? "0" : "") + value.toString(16);
    }

    function hsla(h, s, l, a) {
      if (a <= 0) h = s = l = NaN;
      else if (l <= 0 || l >= 1) h = s = NaN;
      else if (s <= 0) h = NaN;
      return new Hsl(h, s, l, a);
    }

    function hslConvert(o) {
      if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
      if (!(o instanceof Color)) o = color(o);
      if (!o) return new Hsl;
      if (o instanceof Hsl) return o;
      o = o.rgb();
      var r = o.r / 255,
          g = o.g / 255,
          b = o.b / 255,
          min = Math.min(r, g, b),
          max = Math.max(r, g, b),
          h = NaN,
          s = max - min,
          l = (max + min) / 2;
      if (s) {
        if (r === max) h = (g - b) / s + (g < b) * 6;
        else if (g === max) h = (b - r) / s + 2;
        else h = (r - g) / s + 4;
        s /= l < 0.5 ? max + min : 2 - max - min;
        h *= 60;
      } else {
        s = l > 0 && l < 1 ? 0 : h;
      }
      return new Hsl(h, s, l, o.opacity);
    }

    function hsl(h, s, l, opacity) {
      return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
    }

    function Hsl(h, s, l, opacity) {
      this.h = +h;
      this.s = +s;
      this.l = +l;
      this.opacity = +opacity;
    }

    define(Hsl, hsl, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      rgb: function() {
        var h = this.h % 360 + (this.h < 0) * 360,
            s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
            l = this.l,
            m2 = l + (l < 0.5 ? l : 1 - l) * s,
            m1 = 2 * l - m2;
        return new Rgb(
          hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
          hsl2rgb(h, m1, m2),
          hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
          this.opacity
        );
      },
      displayable: function() {
        return (0 <= this.s && this.s <= 1 || isNaN(this.s))
            && (0 <= this.l && this.l <= 1)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      formatHsl: function() {
        var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
        return (a === 1 ? "hsl(" : "hsla(")
            + (this.h || 0) + ", "
            + (this.s || 0) * 100 + "%, "
            + (this.l || 0) * 100 + "%"
            + (a === 1 ? ")" : ", " + a + ")");
      }
    }));

    /* From FvD 13.37, CSS Color Module Level 3 */
    function hsl2rgb(h, m1, m2) {
      return (h < 60 ? m1 + (m2 - m1) * h / 60
          : h < 180 ? m2
          : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
          : m1) * 255;
    }

    var constant$1 = x => () => x;

    function linear$1(a, d) {
      return function(t) {
        return a + t * d;
      };
    }

    function exponential(a, b, y) {
      return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
        return Math.pow(a + t * b, y);
      };
    }

    function gamma(y) {
      return (y = +y) === 1 ? nogamma : function(a, b) {
        return b - a ? exponential(a, b, y) : constant$1(isNaN(a) ? b : a);
      };
    }

    function nogamma(a, b) {
      var d = b - a;
      return d ? linear$1(a, d) : constant$1(isNaN(a) ? b : a);
    }

    var rgb = (function rgbGamma(y) {
      var color = gamma(y);

      function rgb(start, end) {
        var r = color((start = rgb$1(start)).r, (end = rgb$1(end)).r),
            g = color(start.g, end.g),
            b = color(start.b, end.b),
            opacity = nogamma(start.opacity, end.opacity);
        return function(t) {
          start.r = r(t);
          start.g = g(t);
          start.b = b(t);
          start.opacity = opacity(t);
          return start + "";
        };
      }

      rgb.gamma = rgbGamma;

      return rgb;
    })(1);

    function numberArray(a, b) {
      if (!b) b = [];
      var n = a ? Math.min(b.length, a.length) : 0,
          c = b.slice(),
          i;
      return function(t) {
        for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
        return c;
      };
    }

    function isNumberArray(x) {
      return ArrayBuffer.isView(x) && !(x instanceof DataView);
    }

    function genericArray(a, b) {
      var nb = b ? b.length : 0,
          na = a ? Math.min(nb, a.length) : 0,
          x = new Array(na),
          c = new Array(nb),
          i;

      for (i = 0; i < na; ++i) x[i] = interpolate(a[i], b[i]);
      for (; i < nb; ++i) c[i] = b[i];

      return function(t) {
        for (i = 0; i < na; ++i) c[i] = x[i](t);
        return c;
      };
    }

    function date(a, b) {
      var d = new Date;
      return a = +a, b = +b, function(t) {
        return d.setTime(a * (1 - t) + b * t), d;
      };
    }

    function interpolateNumber(a, b) {
      return a = +a, b = +b, function(t) {
        return a * (1 - t) + b * t;
      };
    }

    function object(a, b) {
      var i = {},
          c = {},
          k;

      if (a === null || typeof a !== "object") a = {};
      if (b === null || typeof b !== "object") b = {};

      for (k in b) {
        if (k in a) {
          i[k] = interpolate(a[k], b[k]);
        } else {
          c[k] = b[k];
        }
      }

      return function(t) {
        for (k in i) c[k] = i[k](t);
        return c;
      };
    }

    var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
        reB = new RegExp(reA.source, "g");

    function zero(b) {
      return function() {
        return b;
      };
    }

    function one(b) {
      return function(t) {
        return b(t) + "";
      };
    }

    function string(a, b) {
      var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
          am, // current match in a
          bm, // current match in b
          bs, // string preceding current number in b, if any
          i = -1, // index in s
          s = [], // string constants and placeholders
          q = []; // number interpolators

      // Coerce inputs to strings.
      a = a + "", b = b + "";

      // Interpolate pairs of numbers in a & b.
      while ((am = reA.exec(a))
          && (bm = reB.exec(b))) {
        if ((bs = bm.index) > bi) { // a string precedes the next number in b
          bs = b.slice(bi, bs);
          if (s[i]) s[i] += bs; // coalesce with previous string
          else s[++i] = bs;
        }
        if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
          if (s[i]) s[i] += bm; // coalesce with previous string
          else s[++i] = bm;
        } else { // interpolate non-matching numbers
          s[++i] = null;
          q.push({i: i, x: interpolateNumber(am, bm)});
        }
        bi = reB.lastIndex;
      }

      // Add remains of b.
      if (bi < b.length) {
        bs = b.slice(bi);
        if (s[i]) s[i] += bs; // coalesce with previous string
        else s[++i] = bs;
      }

      // Special optimization for only a single match.
      // Otherwise, interpolate each of the numbers and rejoin the string.
      return s.length < 2 ? (q[0]
          ? one(q[0].x)
          : zero(b))
          : (b = q.length, function(t) {
              for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
              return s.join("");
            });
    }

    function interpolate(a, b) {
      var t = typeof b, c;
      return b == null || t === "boolean" ? constant$1(b)
          : (t === "number" ? interpolateNumber
          : t === "string" ? ((c = color(b)) ? (b = c, rgb) : string)
          : b instanceof color ? rgb
          : b instanceof Date ? date
          : isNumberArray(b) ? numberArray
          : Array.isArray(b) ? genericArray
          : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
          : interpolateNumber)(a, b);
    }

    function interpolateRound(a, b) {
      return a = +a, b = +b, function(t) {
        return Math.round(a * (1 - t) + b * t);
      };
    }

    function constants(x) {
      return function() {
        return x;
      };
    }

    function number(x) {
      return +x;
    }

    var unit = [0, 1];

    function identity$1(x) {
      return x;
    }

    function normalize(a, b) {
      return (b -= (a = +a))
          ? function(x) { return (x - a) / b; }
          : constants(isNaN(b) ? NaN : 0.5);
    }

    function clamper(a, b) {
      var t;
      if (a > b) t = a, a = b, b = t;
      return function(x) { return Math.max(a, Math.min(b, x)); };
    }

    // normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
    // interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
    function bimap(domain, range, interpolate) {
      var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
      if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
      else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
      return function(x) { return r0(d0(x)); };
    }

    function polymap(domain, range, interpolate) {
      var j = Math.min(domain.length, range.length) - 1,
          d = new Array(j),
          r = new Array(j),
          i = -1;

      // Reverse descending domains.
      if (domain[j] < domain[0]) {
        domain = domain.slice().reverse();
        range = range.slice().reverse();
      }

      while (++i < j) {
        d[i] = normalize(domain[i], domain[i + 1]);
        r[i] = interpolate(range[i], range[i + 1]);
      }

      return function(x) {
        var i = bisectRight(domain, x, 1, j) - 1;
        return r[i](d[i](x));
      };
    }

    function copy(source, target) {
      return target
          .domain(source.domain())
          .range(source.range())
          .interpolate(source.interpolate())
          .clamp(source.clamp())
          .unknown(source.unknown());
    }

    function transformer() {
      var domain = unit,
          range = unit,
          interpolate$1 = interpolate,
          transform,
          untransform,
          unknown,
          clamp = identity$1,
          piecewise,
          output,
          input;

      function rescale() {
        var n = Math.min(domain.length, range.length);
        if (clamp !== identity$1) clamp = clamper(domain[0], domain[n - 1]);
        piecewise = n > 2 ? polymap : bimap;
        output = input = null;
        return scale;
      }

      function scale(x) {
        return x == null || isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate$1)))(transform(clamp(x)));
      }

      scale.invert = function(y) {
        return clamp(untransform((input || (input = piecewise(range, domain.map(transform), interpolateNumber)))(y)));
      };

      scale.domain = function(_) {
        return arguments.length ? (domain = Array.from(_, number), rescale()) : domain.slice();
      };

      scale.range = function(_) {
        return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
      };

      scale.rangeRound = function(_) {
        return range = Array.from(_), interpolate$1 = interpolateRound, rescale();
      };

      scale.clamp = function(_) {
        return arguments.length ? (clamp = _ ? true : identity$1, rescale()) : clamp !== identity$1;
      };

      scale.interpolate = function(_) {
        return arguments.length ? (interpolate$1 = _, rescale()) : interpolate$1;
      };

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
      };

      return function(t, u) {
        transform = t, untransform = u;
        return rescale();
      };
    }

    function continuous() {
      return transformer()(identity$1, identity$1);
    }

    function formatDecimal(x) {
      return Math.abs(x = Math.round(x)) >= 1e21
          ? x.toLocaleString("en").replace(/,/g, "")
          : x.toString(10);
    }

    // Computes the decimal coefficient and exponent of the specified number x with
    // significant digits p, where x is positive and p is in [1, 21] or undefined.
    // For example, formatDecimalParts(1.23) returns ["123", 0].
    function formatDecimalParts(x, p) {
      if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
      var i, coefficient = x.slice(0, i);

      // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
      // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
      return [
        coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
        +x.slice(i + 1)
      ];
    }

    function exponent(x) {
      return x = formatDecimalParts(Math.abs(x)), x ? x[1] : NaN;
    }

    function formatGroup(grouping, thousands) {
      return function(value, width) {
        var i = value.length,
            t = [],
            j = 0,
            g = grouping[0],
            length = 0;

        while (i > 0 && g > 0) {
          if (length + g + 1 > width) g = Math.max(1, width - length);
          t.push(value.substring(i -= g, i + g));
          if ((length += g + 1) > width) break;
          g = grouping[j = (j + 1) % grouping.length];
        }

        return t.reverse().join(thousands);
      };
    }

    function formatNumerals(numerals) {
      return function(value) {
        return value.replace(/[0-9]/g, function(i) {
          return numerals[+i];
        });
      };
    }

    // [[fill]align][sign][symbol][0][width][,][.precision][~][type]
    var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;

    function formatSpecifier(specifier) {
      if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
      var match;
      return new FormatSpecifier({
        fill: match[1],
        align: match[2],
        sign: match[3],
        symbol: match[4],
        zero: match[5],
        width: match[6],
        comma: match[7],
        precision: match[8] && match[8].slice(1),
        trim: match[9],
        type: match[10]
      });
    }

    formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

    function FormatSpecifier(specifier) {
      this.fill = specifier.fill === undefined ? " " : specifier.fill + "";
      this.align = specifier.align === undefined ? ">" : specifier.align + "";
      this.sign = specifier.sign === undefined ? "-" : specifier.sign + "";
      this.symbol = specifier.symbol === undefined ? "" : specifier.symbol + "";
      this.zero = !!specifier.zero;
      this.width = specifier.width === undefined ? undefined : +specifier.width;
      this.comma = !!specifier.comma;
      this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
      this.trim = !!specifier.trim;
      this.type = specifier.type === undefined ? "" : specifier.type + "";
    }

    FormatSpecifier.prototype.toString = function() {
      return this.fill
          + this.align
          + this.sign
          + this.symbol
          + (this.zero ? "0" : "")
          + (this.width === undefined ? "" : Math.max(1, this.width | 0))
          + (this.comma ? "," : "")
          + (this.precision === undefined ? "" : "." + Math.max(0, this.precision | 0))
          + (this.trim ? "~" : "")
          + this.type;
    };

    // Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
    function formatTrim(s) {
      out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
        switch (s[i]) {
          case ".": i0 = i1 = i; break;
          case "0": if (i0 === 0) i0 = i; i1 = i; break;
          default: if (!+s[i]) break out; if (i0 > 0) i0 = 0; break;
        }
      }
      return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
    }

    var prefixExponent;

    function formatPrefixAuto(x, p) {
      var d = formatDecimalParts(x, p);
      if (!d) return x + "";
      var coefficient = d[0],
          exponent = d[1],
          i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
          n = coefficient.length;
      return i === n ? coefficient
          : i > n ? coefficient + new Array(i - n + 1).join("0")
          : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
          : "0." + new Array(1 - i).join("0") + formatDecimalParts(x, Math.max(0, p + i - 1))[0]; // less than 1y!
    }

    function formatRounded(x, p) {
      var d = formatDecimalParts(x, p);
      if (!d) return x + "";
      var coefficient = d[0],
          exponent = d[1];
      return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
          : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
          : coefficient + new Array(exponent - coefficient.length + 2).join("0");
    }

    var formatTypes = {
      "%": (x, p) => (x * 100).toFixed(p),
      "b": (x) => Math.round(x).toString(2),
      "c": (x) => x + "",
      "d": formatDecimal,
      "e": (x, p) => x.toExponential(p),
      "f": (x, p) => x.toFixed(p),
      "g": (x, p) => x.toPrecision(p),
      "o": (x) => Math.round(x).toString(8),
      "p": (x, p) => formatRounded(x * 100, p),
      "r": formatRounded,
      "s": formatPrefixAuto,
      "X": (x) => Math.round(x).toString(16).toUpperCase(),
      "x": (x) => Math.round(x).toString(16)
    };

    function identity(x) {
      return x;
    }

    var map = Array.prototype.map,
        prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

    function formatLocale(locale) {
      var group = locale.grouping === undefined || locale.thousands === undefined ? identity : formatGroup(map.call(locale.grouping, Number), locale.thousands + ""),
          currencyPrefix = locale.currency === undefined ? "" : locale.currency[0] + "",
          currencySuffix = locale.currency === undefined ? "" : locale.currency[1] + "",
          decimal = locale.decimal === undefined ? "." : locale.decimal + "",
          numerals = locale.numerals === undefined ? identity : formatNumerals(map.call(locale.numerals, String)),
          percent = locale.percent === undefined ? "%" : locale.percent + "",
          minus = locale.minus === undefined ? "−" : locale.minus + "",
          nan = locale.nan === undefined ? "NaN" : locale.nan + "";

      function newFormat(specifier) {
        specifier = formatSpecifier(specifier);

        var fill = specifier.fill,
            align = specifier.align,
            sign = specifier.sign,
            symbol = specifier.symbol,
            zero = specifier.zero,
            width = specifier.width,
            comma = specifier.comma,
            precision = specifier.precision,
            trim = specifier.trim,
            type = specifier.type;

        // The "n" type is an alias for ",g".
        if (type === "n") comma = true, type = "g";

        // The "" type, and any invalid type, is an alias for ".12~g".
        else if (!formatTypes[type]) precision === undefined && (precision = 12), trim = true, type = "g";

        // If zero fill is specified, padding goes after sign and before digits.
        if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

        // Compute the prefix and suffix.
        // For SI-prefix, the suffix is lazily computed.
        var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
            suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";

        // What format function should we use?
        // Is this an integer type?
        // Can this type generate exponential notation?
        var formatType = formatTypes[type],
            maybeSuffix = /[defgprs%]/.test(type);

        // Set the default precision if not specified,
        // or clamp the specified precision to the supported range.
        // For significant precision, it must be in [1, 21].
        // For fixed precision, it must be in [0, 20].
        precision = precision === undefined ? 6
            : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
            : Math.max(0, Math.min(20, precision));

        function format(value) {
          var valuePrefix = prefix,
              valueSuffix = suffix,
              i, n, c;

          if (type === "c") {
            valueSuffix = formatType(value) + valueSuffix;
            value = "";
          } else {
            value = +value;

            // Determine the sign. -0 is not less than 0, but 1 / -0 is!
            var valueNegative = value < 0 || 1 / value < 0;

            // Perform the initial formatting.
            value = isNaN(value) ? nan : formatType(Math.abs(value), precision);

            // Trim insignificant zeros.
            if (trim) value = formatTrim(value);

            // If a negative value rounds to zero after formatting, and no explicit positive sign is requested, hide the sign.
            if (valueNegative && +value === 0 && sign !== "+") valueNegative = false;

            // Compute the prefix and suffix.
            valuePrefix = (valueNegative ? (sign === "(" ? sign : minus) : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
            valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");

            // Break the formatted value into the integer “value” part that can be
            // grouped, and fractional or exponential “suffix” part that is not.
            if (maybeSuffix) {
              i = -1, n = value.length;
              while (++i < n) {
                if (c = value.charCodeAt(i), 48 > c || c > 57) {
                  valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                  value = value.slice(0, i);
                  break;
                }
              }
            }
          }

          // If the fill character is not "0", grouping is applied before padding.
          if (comma && !zero) value = group(value, Infinity);

          // Compute the padding.
          var length = valuePrefix.length + value.length + valueSuffix.length,
              padding = length < width ? new Array(width - length + 1).join(fill) : "";

          // If the fill character is "0", grouping is applied after padding.
          if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

          // Reconstruct the final output based on the desired alignment.
          switch (align) {
            case "<": value = valuePrefix + value + valueSuffix + padding; break;
            case "=": value = valuePrefix + padding + value + valueSuffix; break;
            case "^": value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length); break;
            default: value = padding + valuePrefix + value + valueSuffix; break;
          }

          return numerals(value);
        }

        format.toString = function() {
          return specifier + "";
        };

        return format;
      }

      function formatPrefix(specifier, value) {
        var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
            e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
            k = Math.pow(10, -e),
            prefix = prefixes[8 + e / 3];
        return function(value) {
          return f(k * value) + prefix;
        };
      }

      return {
        format: newFormat,
        formatPrefix: formatPrefix
      };
    }

    var locale;
    var format;
    var formatPrefix;

    defaultLocale({
      thousands: ",",
      grouping: [3],
      currency: ["$", ""]
    });

    function defaultLocale(definition) {
      locale = formatLocale(definition);
      format = locale.format;
      formatPrefix = locale.formatPrefix;
      return locale;
    }

    function precisionFixed(step) {
      return Math.max(0, -exponent(Math.abs(step)));
    }

    function precisionPrefix(step, value) {
      return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
    }

    function precisionRound(step, max) {
      step = Math.abs(step), max = Math.abs(max) - step;
      return Math.max(0, exponent(max) - exponent(step)) + 1;
    }

    function tickFormat(start, stop, count, specifier) {
      var step = tickStep(start, stop, count),
          precision;
      specifier = formatSpecifier(specifier == null ? ",f" : specifier);
      switch (specifier.type) {
        case "s": {
          var value = Math.max(Math.abs(start), Math.abs(stop));
          if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
          return formatPrefix(specifier, value);
        }
        case "":
        case "e":
        case "g":
        case "p":
        case "r": {
          if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
          break;
        }
        case "f":
        case "%": {
          if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
          break;
        }
      }
      return format(specifier);
    }

    function linearish(scale) {
      var domain = scale.domain;

      scale.ticks = function(count) {
        var d = domain();
        return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
      };

      scale.tickFormat = function(count, specifier) {
        var d = domain();
        return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
      };

      scale.nice = function(count) {
        if (count == null) count = 10;

        var d = domain();
        var i0 = 0;
        var i1 = d.length - 1;
        var start = d[i0];
        var stop = d[i1];
        var prestep;
        var step;
        var maxIter = 10;

        if (stop < start) {
          step = start, start = stop, stop = step;
          step = i0, i0 = i1, i1 = step;
        }
        
        while (maxIter-- > 0) {
          step = tickIncrement(start, stop, count);
          if (step === prestep) {
            d[i0] = start;
            d[i1] = stop;
            return domain(d);
          } else if (step > 0) {
            start = Math.floor(start / step) * step;
            stop = Math.ceil(stop / step) * step;
          } else if (step < 0) {
            start = Math.ceil(start * step) / step;
            stop = Math.floor(stop * step) / step;
          } else {
            break;
          }
          prestep = step;
        }

        return scale;
      };

      return scale;
    }

    function linear() {
      var scale = continuous();

      scale.copy = function() {
        return copy(scale, linear());
      };

      initRange.apply(scale, arguments);

      return linearish(scale);
    }

    /* src/components/SpiralViolence.svelte generated by Svelte v3.38.2 */
    const file$4 = "src/components/SpiralViolence.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (35:4) 
    function create_background_slot(ctx) {
    	let div;
    	let scatter;
    	let div_resize_listener;
    	let current;

    	scatter = new Scatter({
    			props: {
    				width: /*width*/ ctx[1],
    				height: /*height*/ ctx[2],
    				data: /*data*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(scatter.$$.fragment);
    			attr_dev(div, "class", "graphic svelte-i962o0");
    			attr_dev(div, "slot", "background");
    			add_render_callback(() => /*div_elementresize_handler*/ ctx[6].call(div));
    			add_location(div, file$4, 34, 4, 929);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(scatter, div, null);
    			div_resize_listener = add_resize_listener(div, /*div_elementresize_handler*/ ctx[6].bind(div));
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const scatter_changes = {};
    			if (dirty & /*width*/ 2) scatter_changes.width = /*width*/ ctx[1];
    			if (dirty & /*height*/ 4) scatter_changes.height = /*height*/ ctx[2];
    			if (dirty & /*data*/ 16) scatter_changes.data = /*data*/ ctx[4];
    			scatter.$set(scatter_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(scatter.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(scatter.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(scatter);
    			div_resize_listener();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_background_slot.name,
    		type: "slot",
    		source: "(35:4) ",
    		ctx
    	});

    	return block;
    }

    // (44:6) {#each text as p}
    function create_each_block$3(ctx) {
    	let section;
    	let p0;
    	let t0_value = Number(/*p*/ ctx[12].data).toLocaleString("de-DE") + "";
    	let t0;
    	let t1;
    	let p1;
    	let t2_value = /*p*/ ctx[12].p + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			section = element("section");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			p1 = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			attr_dev(p0, "class", "narrow number svelte-i962o0");
    			add_location(p0, file$4, 45, 10, 1202);
    			attr_dev(p1, "class", "narrow svelte-i962o0");
    			add_location(p1, file$4, 46, 10, 1282);
    			attr_dev(section, "class", "col-text svelte-i962o0");
    			add_location(section, file$4, 44, 8, 1165);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, p0);
    			append_dev(p0, t0);
    			append_dev(section, t1);
    			append_dev(section, p1);
    			append_dev(p1, t2);
    			append_dev(section, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text*/ 1 && t0_value !== (t0_value = Number(/*p*/ ctx[12].data).toLocaleString("de-DE") + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*text*/ 1 && t2_value !== (t2_value = /*p*/ ctx[12].p + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(44:6) {#each text as p}",
    		ctx
    	});

    	return block;
    }

    // (43:4) 
    function create_foreground_slot(ctx) {
    	let div;
    	let each_value = /*text*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "slot", "foreground");
    			add_location(div, file$4, 42, 4, 1109);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text, Number*/ 1) {
    				each_value = /*text*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_foreground_slot.name,
    		type: "slot",
    		source: "(43:4) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let scroller;
    	let updating_progress;
    	let current;

    	function scroller_progress_binding(value) {
    		/*scroller_progress_binding*/ ctx[7](value);
    	}

    	let scroller_props = {
    		$$slots: {
    			foreground: [create_foreground_slot],
    			background: [create_background_slot]
    		},
    		$$scope: { ctx }
    	};

    	if (/*progress*/ ctx[3] !== void 0) {
    		scroller_props.progress = /*progress*/ ctx[3];
    	}

    	scroller = new Scroller({ props: scroller_props, $$inline: true });
    	binding_callbacks.push(() => bind(scroller, "progress", scroller_progress_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(scroller.$$.fragment);
    			attr_dev(div, "class", "graphic-wrapper svelte-i962o0");
    			add_location(div, file$4, 32, 0, 868);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(scroller, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const scroller_changes = {};

    			if (dirty & /*$$scope, text, height, width, data*/ 32791) {
    				scroller_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_progress && dirty & /*progress*/ 8) {
    				updating_progress = true;
    				scroller_changes.progress = /*progress*/ ctx[3];
    				add_flush_callback(() => updating_progress = false);
    			}

    			scroller.$set(scroller_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(scroller.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(scroller.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(scroller);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let n;
    	let data;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SpiralViolence", slots, []);
    	let { text } = $$props;
    	let dots = text.map(d => d.data / 100);
    	let range = text.map(d => d.range);
    	let width, height;
    	let progress = 0;
    	let scaleRadius = linear().domain(dots).range(range);
    	let scaleNumber = linear().domain([...new Array(dots.length)].map((d, i) => i / (dots.length - 1))).range(dots);
    	const writable_props = ["text"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SpiralViolence> was created with unknown prop '${key}'`);
    	});

    	function div_elementresize_handler() {
    		height = this.clientHeight;
    		width = this.clientWidth;
    		$$invalidate(2, height);
    		$$invalidate(1, width);
    	}

    	function scroller_progress_binding(value) {
    		progress = value;
    		$$invalidate(3, progress);
    	}

    	$$self.$$set = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    	};

    	$$self.$capture_state = () => ({
    		Scatter,
    		Scroller,
    		scaleLinear: linear,
    		text,
    		dots,
    		range,
    		width,
    		height,
    		progress,
    		scaleRadius,
    		scaleNumber,
    		n,
    		data
    	});

    	$$self.$inject_state = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("dots" in $$props) dots = $$props.dots;
    		if ("range" in $$props) range = $$props.range;
    		if ("width" in $$props) $$invalidate(1, width = $$props.width);
    		if ("height" in $$props) $$invalidate(2, height = $$props.height);
    		if ("progress" in $$props) $$invalidate(3, progress = $$props.progress);
    		if ("scaleRadius" in $$props) $$invalidate(10, scaleRadius = $$props.scaleRadius);
    		if ("scaleNumber" in $$props) $$invalidate(11, scaleNumber = $$props.scaleNumber);
    		if ("n" in $$props) $$invalidate(5, n = $$props.n);
    		if ("data" in $$props) $$invalidate(4, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*progress*/ 8) {
    			$$invalidate(5, n = progress < 0 ? 4 : Math.floor(scaleNumber(progress)));
    		}

    		if ($$self.$$.dirty & /*n, width, height*/ 38) {
    			$$invalidate(4, data = [...new Array(n)].map((d, i) => {
    				const z = Math.sqrt(i / n);
    				const theta = i * 2.4;
    				const x = width / 2 + z * Math.cos(theta) * height / 2;
    				const y = height / 2 + z * Math.sin(theta) * height / 2;
    				const r = scaleRadius(n);
    				return { x, y, r };
    			}));
    		}
    	};

    	return [
    		text,
    		width,
    		height,
    		progress,
    		data,
    		n,
    		div_elementresize_handler,
    		scroller_progress_binding
    	];
    }

    class SpiralViolence extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { text: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SpiralViolence",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*text*/ ctx[0] === undefined && !("text" in props)) {
    			console.warn("<SpiralViolence> was created without expected prop 'text'");
    		}
    	}

    	get text() {
    		throw new Error("<SpiralViolence>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<SpiralViolence>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const pi = Math.PI,
        tau = 2 * pi,
        epsilon = 1e-6,
        tauEpsilon = tau - epsilon;

    function Path() {
      this._x0 = this._y0 = // start of current subpath
      this._x1 = this._y1 = null; // end of current subpath
      this._ = "";
    }

    function path() {
      return new Path;
    }

    Path.prototype = path.prototype = {
      constructor: Path,
      moveTo: function(x, y) {
        this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y);
      },
      closePath: function() {
        if (this._x1 !== null) {
          this._x1 = this._x0, this._y1 = this._y0;
          this._ += "Z";
        }
      },
      lineTo: function(x, y) {
        this._ += "L" + (this._x1 = +x) + "," + (this._y1 = +y);
      },
      quadraticCurveTo: function(x1, y1, x, y) {
        this._ += "Q" + (+x1) + "," + (+y1) + "," + (this._x1 = +x) + "," + (this._y1 = +y);
      },
      bezierCurveTo: function(x1, y1, x2, y2, x, y) {
        this._ += "C" + (+x1) + "," + (+y1) + "," + (+x2) + "," + (+y2) + "," + (this._x1 = +x) + "," + (this._y1 = +y);
      },
      arcTo: function(x1, y1, x2, y2, r) {
        x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r = +r;
        var x0 = this._x1,
            y0 = this._y1,
            x21 = x2 - x1,
            y21 = y2 - y1,
            x01 = x0 - x1,
            y01 = y0 - y1,
            l01_2 = x01 * x01 + y01 * y01;

        // Is the radius negative? Error.
        if (r < 0) throw new Error("negative radius: " + r);

        // Is this path empty? Move to (x1,y1).
        if (this._x1 === null) {
          this._ += "M" + (this._x1 = x1) + "," + (this._y1 = y1);
        }

        // Or, is (x1,y1) coincident with (x0,y0)? Do nothing.
        else if (!(l01_2 > epsilon));

        // Or, are (x0,y0), (x1,y1) and (x2,y2) collinear?
        // Equivalently, is (x1,y1) coincident with (x2,y2)?
        // Or, is the radius zero? Line to (x1,y1).
        else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon) || !r) {
          this._ += "L" + (this._x1 = x1) + "," + (this._y1 = y1);
        }

        // Otherwise, draw an arc!
        else {
          var x20 = x2 - x0,
              y20 = y2 - y0,
              l21_2 = x21 * x21 + y21 * y21,
              l20_2 = x20 * x20 + y20 * y20,
              l21 = Math.sqrt(l21_2),
              l01 = Math.sqrt(l01_2),
              l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),
              t01 = l / l01,
              t21 = l / l21;

          // If the start tangent is not coincident with (x0,y0), line to.
          if (Math.abs(t01 - 1) > epsilon) {
            this._ += "L" + (x1 + t01 * x01) + "," + (y1 + t01 * y01);
          }

          this._ += "A" + r + "," + r + ",0,0," + (+(y01 * x20 > x01 * y20)) + "," + (this._x1 = x1 + t21 * x21) + "," + (this._y1 = y1 + t21 * y21);
        }
      },
      arc: function(x, y, r, a0, a1, ccw) {
        x = +x, y = +y, r = +r, ccw = !!ccw;
        var dx = r * Math.cos(a0),
            dy = r * Math.sin(a0),
            x0 = x + dx,
            y0 = y + dy,
            cw = 1 ^ ccw,
            da = ccw ? a0 - a1 : a1 - a0;

        // Is the radius negative? Error.
        if (r < 0) throw new Error("negative radius: " + r);

        // Is this path empty? Move to (x0,y0).
        if (this._x1 === null) {
          this._ += "M" + x0 + "," + y0;
        }

        // Or, is (x0,y0) not coincident with the previous point? Line to (x0,y0).
        else if (Math.abs(this._x1 - x0) > epsilon || Math.abs(this._y1 - y0) > epsilon) {
          this._ += "L" + x0 + "," + y0;
        }

        // Is this arc empty? We’re done.
        if (!r) return;

        // Does the angle go the wrong way? Flip the direction.
        if (da < 0) da = da % tau + tau;

        // Is this a complete circle? Draw two arcs to complete the circle.
        if (da > tauEpsilon) {
          this._ += "A" + r + "," + r + ",0,1," + cw + "," + (x - dx) + "," + (y - dy) + "A" + r + "," + r + ",0,1," + cw + "," + (this._x1 = x0) + "," + (this._y1 = y0);
        }

        // Is this arc non-empty? Draw an arc!
        else if (da > epsilon) {
          this._ += "A" + r + "," + r + ",0," + (+(da >= pi)) + "," + cw + "," + (this._x1 = x + r * Math.cos(a1)) + "," + (this._y1 = y + r * Math.sin(a1));
        }
      },
      rect: function(x, y, w, h) {
        this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y) + "h" + (+w) + "v" + (+h) + "h" + (-w) + "Z";
      },
      toString: function() {
        return this._;
      }
    };

    function constant(x) {
      return function constant() {
        return x;
      };
    }

    var slice = Array.prototype.slice;

    function x(p) {
      return p[0];
    }

    function y(p) {
      return p[1];
    }

    function linkSource(d) {
      return d.source;
    }

    function linkTarget(d) {
      return d.target;
    }

    function link(curve) {
      var source = linkSource,
          target = linkTarget,
          x$1 = x,
          y$1 = y,
          context = null;

      function link() {
        var buffer, argv = slice.call(arguments), s = source.apply(this, argv), t = target.apply(this, argv);
        if (!context) context = buffer = path();
        curve(context, +x$1.apply(this, (argv[0] = s, argv)), +y$1.apply(this, argv), +x$1.apply(this, (argv[0] = t, argv)), +y$1.apply(this, argv));
        if (buffer) return context = null, buffer + "" || null;
      }

      link.source = function(_) {
        return arguments.length ? (source = _, link) : source;
      };

      link.target = function(_) {
        return arguments.length ? (target = _, link) : target;
      };

      link.x = function(_) {
        return arguments.length ? (x$1 = typeof _ === "function" ? _ : constant(+_), link) : x$1;
      };

      link.y = function(_) {
        return arguments.length ? (y$1 = typeof _ === "function" ? _ : constant(+_), link) : y$1;
      };

      link.context = function(_) {
        return arguments.length ? ((context = _ == null ? null : _), link) : context;
      };

      return link;
    }

    function curveVertical(context, x0, y0, x1, y1) {
      context.moveTo(x0, y0);
      context.bezierCurveTo(x0, y0 = (y0 + y1) / 2, x1, y0, x1, y1);
    }

    function linkVertical() {
      return link(curveVertical);
    }

    var data = [
    	{
    		level: "0",
    		source: "Social",
    		target: "STPT",
    		col: "2"
    	},
    	{
    		level: "0",
    		source: "Atenció a les dones",
    		target: "SIADS",
    		col: "4.5"
    	},
    	{
    		level: "0",
    		source: "Atenció a les dones",
    		target: "SIES",
    		col: "4.5"
    	},
    	{
    		level: "0",
    		source: "Atenció a les dones",
    		target: "SIC",
    		col: "4.5"
    	},
    	{
    		level: "0",
    		source: "Atenció a les dones",
    		target: "OAVD",
    		col: "4.5"
    	},
    	{
    		level: "0",
    		source: "Atenció a les dones",
    		target: "GAV/PG-ME",
    		col: "4.5"
    	},
    	{
    		level: "0",
    		source: "Atenció a les dones",
    		target: "EFES",
    		col: "4.5"
    	},
    	{
    		level: "0",
    		source: "Atenció a les dones",
    		target: "USAV",
    		col: "4.5"
    	},
    	{
    		level: "0",
    		source: "Jutjats de guàrdia",
    		target: "OAVD",
    		col: "9"
    	},
    	{
    		level: "0",
    		source: "Familias, veïns ...",
    		target: "Jutjats de guàrdia",
    		col: "11"
    	},
    	{
    		level: "0",
    		source: "Familias, veïns ...",
    		target: "Cossos de seguretat",
    		col: "11"
    	},
    	{
    		level: "0",
    		source: "Cossos de seguretat",
    		target: "GAV/PG-ME",
    		col: "13"
    	},
    	{
    		level: "0",
    		source: "Cossos de seguretat",
    		target: "Unitat de menors",
    		col: "13"
    	},
    	{
    		level: "0",
    		source: "Cossos de seguretat",
    		target: "Sanitat",
    		col: "13"
    	},
    	{
    		level: "0",
    		source: "Sanitat",
    		target: "Cossos de seguretat",
    		col: "16"
    	},
    	{
    		level: "0",
    		source: "Sanitat",
    		target: "EFES",
    		col: "16"
    	},
    	{
    		level: "0",
    		source: "Educació",
    		target: "Cossos de seguretat",
    		col: "21"
    	},
    	{
    		level: "0",
    		source: "Educació",
    		target: "USAV",
    		col: "21"
    	},
    	{
    		level: "0",
    		source: "Educació",
    		target: "EAP",
    		col: "21"
    	},
    	{
    		level: "0",
    		source: "Educació",
    		target: "USCE",
    		col: "21"
    	},
    	{
    		level: "0",
    		source: "Telèfon infancia respón",
    		target: "UDEPMI",
    		col: "24"
    	},
    	{
    		level: "1",
    		source: "STPT",
    		target: "Justícia",
    		col: "2"
    	},
    	{
    		level: "1",
    		source: "SIADS",
    		target: "Justícia",
    		col: "3.5"
    	},
    	{
    		level: "1",
    		source: "SIES",
    		target: "Justícia",
    		col: "4.5"
    	},
    	{
    		level: "1",
    		source: "SIC",
    		target: "Justícia",
    		col: "5.5"
    	},
    	{
    		level: "1",
    		source: "OAVD",
    		target: "Justícia",
    		col: "9"
    	},
    	{
    		level: "1",
    		source: "GAV/PG-ME",
    		target: "Justícia",
    		col: "12.5"
    	},
    	{
    		level: "1",
    		source: "Unitat de menors",
    		target: "Justícia",
    		col: "13.5"
    	},
    	{
    		level: "1",
    		source: "EFES",
    		target: "Justícia",
    		col: "16"
    	},
    	{
    		level: "1",
    		source: "USAV",
    		target: "Justícia",
    		col: "20"
    	},
    	{
    		level: "1",
    		source: "EAP",
    		target: "Justícia",
    		col: "21"
    	},
    	{
    		level: "1",
    		source: "USCE",
    		target: "Justícia",
    		col: "22"
    	},
    	{
    		level: "1",
    		source: "GAV/PG-ME",
    		target: "Serveis socials",
    		col: "12.5"
    	},
    	{
    		level: "1",
    		source: "Unitat de menors",
    		target: "Serveis socials",
    		col: "13.5"
    	},
    	{
    		level: "1",
    		source: "EFES",
    		target: "Serveis socials",
    		col: "16"
    	},
    	{
    		level: "1",
    		source: "USAV",
    		target: "Serveis socials",
    		col: "19"
    	},
    	{
    		level: "1",
    		source: "EAP",
    		target: "Serveis socials",
    		col: "20"
    	},
    	{
    		level: "1",
    		source: "USCE",
    		target: "Serveis socials",
    		col: "21"
    	},
    	{
    		level: "1",
    		source: "UDEPMI",
    		target: "Serveis socials",
    		col: "24"
    	},
    	{
    		level: "1",
    		source: "UDEPMI",
    		target: "EAIA",
    		col: "24"
    	},
    	{
    		level: "1",
    		source: "UDEPMI",
    		target: "EVAMI",
    		col: "24"
    	},
    	{
    		level: "1",
    		source: "UDEPMI",
    		target: "ETCA",
    		col: "24"
    	},
    	{
    		level: "1.5",
    		source: "Barnahus",
    		target: "Justícia",
    		col: "9"
    	},
    	{
    		level: "3.5",
    		source: "EATCAF",
    		target: "Justícia",
    		col: "7"
    	},
    	{
    		level: "2.5",
    		source: "EATP",
    		target: "Justícia",
    		col: "7"
    	},
    	{
    		level: "3",
    		source: "Justícia",
    		target: "EATAF(SATAF)",
    		col: "9"
    	},
    	{
    		level: "3",
    		source: "Justícia",
    		target: "EATCAF",
    		col: "9"
    	},
    	{
    		level: "3",
    		source: "Justícia",
    		target: "EATP",
    		col: "9"
    	},
    	{
    		level: "3",
    		source: "Justícia",
    		target: "Barnahus",
    		col: "9"
    	},
    	{
    		level: "3",
    		source: "Justícia",
    		target: "Sense separació del nucli familiar",
    		col: "9"
    	},
    	{
    		level: "3",
    		source: "Justícia",
    		target: "Amb separació del nucli familiar",
    		col: "9"
    	},
    	{
    		level: "3",
    		source: "EATAF (SATAF)",
    		target: "Justícia",
    		col: "11"
    	},
    	{
    		level: "3",
    		source: "Serveis socials",
    		target: "EAIA",
    		col: "19"
    	},
    	{
    		level: "3",
    		source: "EAIA",
    		target: "Serveis socials",
    		col: "21"
    	},
    	{
    		level: "3",
    		source: "EAIA",
    		target: "SEAIA",
    		col: "21"
    	},
    	{
    		level: "3",
    		source: "EAIA",
    		target: "Situació de risc",
    		col: "21"
    	},
    	{
    		level: "3.5",
    		source: "SEAIA",
    		target: "",
    		col: "22.5"
    	},
    	{
    		level: "4",
    		source: "Amb separació del nucli familiar",
    		target: "ICAA",
    		col: "9"
    	},
    	{
    		level: "4",
    		source: "Amb separació del nucli familiar",
    		target: "Acolliment en familia extensa",
    		col: "9"
    	},
    	{
    		level: "4",
    		source: "Amb separació del nucli familiar",
    		target: "Acolliment en centre residencial",
    		col: "9"
    	},
    	{
    		level: "5",
    		source: "Situació de risc",
    		target: "Serveis socials",
    		col: "20"
    	},
    	{
    		level: "5",
    		source: "ICAA",
    		target: "Atenció en familia adoptiva",
    		col: "3"
    	},
    	{
    		level: "5",
    		source: "ICAA",
    		target: "Acolliment en familia aliena",
    		col: "3"
    	},
    	{
    		level: "5.5",
    		source: "Atenció en familia adoptiva",
    		target: "Adopció",
    		col: "1.5"
    	},
    	{
    		level: "5.5",
    		source: "Acolliment en familia aliena",
    		target: "ASJTET",
    		col: "5"
    	},
    	{
    		level: "5.5",
    		source: "Acolliment en familia extensa",
    		target: "ASJTET",
    		col: "7.5"
    	},
    	{
    		level: "5.5",
    		source: "Acolliment en centre residencial",
    		target: "ASJTET",
    		col: "10"
    	},
    	{
    		level: "5.5",
    		source: "Acolliment en centre residencial",
    		target: "CA",
    		col: "10"
    	},
    	{
    		level: "5.5",
    		source: "Acolliment en centre residencial",
    		target: "CRAE",
    		col: "10"
    	},
    	{
    		level: "5.5",
    		source: "Acolliment en centre residencial",
    		target: "CI",
    		col: "10"
    	},
    	{
    		level: "5.5",
    		source: "Acolliment en centre residencial",
    		target: "Pis assistit",
    		col: "10"
    	},
    	{
    		level: "5.5",
    		source: "Acolliment en centre residencial",
    		target: "CRAI",
    		col: "10"
    	},
    	{
    		level: "5.5",
    		source: "Acolliment en centre residencial",
    		target: "IPI",
    		col: "10"
    	},
    	{
    		level: "5.5",
    		source: "Acolliment en centre residencial",
    		target: "Servei d'acollida i atenció integral",
    		col: "10"
    	},
    	{
    		level: "5.5",
    		source: "Acolliment en centre residencial",
    		target: "Servei de protecció d'emergència",
    		col: "10"
    	},
    	{
    		level: "5.5",
    		source: "Acolliment en centre residencial",
    		target: "Altres tipus de recus",
    		col: "10"
    	},
    	{
    		level: "4",
    		source: "Sense separació del nucli familiar",
    		target: "Situació de risc",
    		col: "19"
    	},
    	{
    		level: "5",
    		source: "Situació de risc",
    		target: "Punts de trobada",
    		col: "20"
    	},
    	{
    		level: "5",
    		source: "Situació de risc",
    		target: "SIS",
    		col: "20"
    	},
    	{
    		level: "5.5",
    		source: "Atenció en familia adoptiva",
    		target: "",
    		col: "1.5"
    	},
    	{
    		level: "5.5",
    		source: "Acolliment en familia aliena",
    		target: "",
    		col: "5"
    	},
    	{
    		level: "5.5",
    		source: "Acolliment en familia extensa",
    		target: "",
    		col: "7.5"
    	},
    	{
    		level: "5.5",
    		source: "Acolliment en centre residencial",
    		target: "",
    		col: "10"
    	},
    	{
    		level: "6",
    		source: "Punts de trobada",
    		target: "",
    		col: "19.5"
    	},
    	{
    		level: "6",
    		source: "SIS",
    		target: "",
    		col: "20.5"
    	},
    	{
    		level: "6",
    		source: "Adopció",
    		target: "",
    		col: "1.5"
    	},
    	{
    		level: "6",
    		source: "ASJTET",
    		target: "",
    		col: "7.5"
    	},
    	{
    		level: "6.5",
    		source: "CA",
    		target: "",
    		col: "6"
    	},
    	{
    		level: "6.5",
    		source: "CRAE",
    		target: "",
    		col: "7"
    	},
    	{
    		level: "6.5",
    		source: "CI",
    		target: "",
    		col: "8"
    	},
    	{
    		level: "6.5",
    		source: "Pis assistit",
    		target: "",
    		col: "9"
    	},
    	{
    		level: "6.5",
    		source: "CRAI",
    		target: "",
    		col: "10"
    	},
    	{
    		level: "6.5",
    		source: "IPI",
    		target: "",
    		col: "11"
    	},
    	{
    		level: "6.5",
    		source: "Servei d'acollida i atenció integral",
    		target: "",
    		col: "12"
    	},
    	{
    		level: "6.5",
    		source: "Servei de protecció d'emergència",
    		target: "",
    		col: "13"
    	},
    	{
    		level: "6.5",
    		source: "Altres tipus de recus",
    		target: "",
    		col: "14"
    	}
    ];

    /* src/components/charts/Network.svelte generated by Svelte v3.38.2 */
    const file$3 = "src/components/charts/Network.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	return child_ctx;
    }

    // (69:0) {#if width}
    function create_if_block$1(ctx) {
    	let svg;
    	let title_1;
    	let t0;
    	let desc_1;
    	let t1;
    	let defs;
    	let marker;
    	let path;
    	let g0;
    	let g1;
    	let g2;
    	let svg_viewBox_value;
    	let t2;
    	let div;
    	let each_value_3 = /*links*/ ctx[7];
    	validate_each_argument(each_value_3);
    	let each_blocks_3 = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks_3[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let each_value_2 = /*selected*/ ctx[8];
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value_1 = /*nodes*/ ctx[6];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*nodes*/ ctx[6];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			title_1 = svg_element("title");
    			t0 = text(/*title*/ ctx[1]);
    			desc_1 = svg_element("desc");
    			t1 = text(/*desc*/ ctx[2]);
    			defs = svg_element("defs");
    			marker = svg_element("marker");
    			path = svg_element("path");
    			g0 = svg_element("g");

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			g1 = svg_element("g");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			g2 = svg_element("g");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(title_1, "id", "title");
    			add_location(title_1, file$3, 76, 1, 1950);
    			attr_dev(desc_1, "id", "desc");
    			add_location(desc_1, file$3, 77, 1, 1985);
    			attr_dev(path, "d", "M 0 0 L 3 2 L 0 4 z");
    			attr_dev(path, "fill", "#abd4ff");
    			add_location(path, file$3, 82, 6, 2177);
    			attr_dev(marker, "id", "arrowhead");
    			attr_dev(marker, "viewBox", "0 0 4 4");
    			attr_dev(marker, "refX", "2");
    			attr_dev(marker, "refY", "2");
    			attr_dev(marker, "markerWidth", "3");
    			attr_dev(marker, "markerHeight", "3");
    			attr_dev(marker, "orient", "auto-start-reverse");
    			add_location(marker, file$3, 79, 8, 2034);
    			add_location(defs, file$3, 78, 4, 2019);
    			add_location(g0, file$3, 85, 4, 2255);
    			add_location(g1, file$3, 97, 4, 2506);
    			add_location(g2, file$3, 109, 1, 2753);
    			attr_dev(svg, "xmlns:svg", "https://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", svg_viewBox_value = "0 0 " + (/*width*/ ctx[3] - /*margin*/ ctx[0].right - /*margin*/ ctx[0].left) + " " + /*height*/ ctx[4]);
    			attr_dev(svg, "width", /*width*/ ctx[3]);
    			attr_dev(svg, "height", /*height*/ ctx[4]);
    			attr_dev(svg, "role", "img");
    			attr_dev(svg, "aria-labelledby", "title desc");
    			add_location(svg, file$3, 69, 0, 1778);
    			attr_dev(div, "class", "annotations svelte-1ytwzoe");
    			add_location(div, file$3, 122, 0, 3008);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, title_1);
    			append_dev(title_1, t0);
    			append_dev(svg, desc_1);
    			append_dev(desc_1, t1);
    			append_dev(svg, defs);
    			append_dev(defs, marker);
    			append_dev(marker, path);
    			append_dev(svg, g0);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].m(g0, null);
    			}

    			append_dev(svg, g1);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(g1, null);
    			}

    			append_dev(svg, g2);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(g2, null);
    			}

    			insert_dev(target, t2, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*title*/ 2) set_data_dev(t0, /*title*/ ctx[1]);
    			if (dirty & /*desc*/ 4) set_data_dev(t1, /*desc*/ ctx[2]);

    			if (dirty & /*linkPath, links*/ 640) {
    				each_value_3 = /*links*/ ctx[7];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks_3[i]) {
    						each_blocks_3[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_3[i] = create_each_block_3(child_ctx);
    						each_blocks_3[i].c();
    						each_blocks_3[i].m(g0, null);
    					}
    				}

    				for (; i < each_blocks_3.length; i += 1) {
    					each_blocks_3[i].d(1);
    				}

    				each_blocks_3.length = each_value_3.length;
    			}

    			if (dirty & /*linkPath, selected*/ 768) {
    				each_value_2 = /*selected*/ ctx[8];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						each_blocks_2[i].m(g1, null);
    					}
    				}

    				for (; i < each_blocks_2.length; i += 1) {
    					each_blocks_2[i].d(1);
    				}

    				each_blocks_2.length = each_value_2.length;
    			}

    			if (dirty & /*nodes, radius, handleOver*/ 2144) {
    				each_value_1 = /*nodes*/ ctx[6];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(g2, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*width, margin, height*/ 25 && svg_viewBox_value !== (svg_viewBox_value = "0 0 " + (/*width*/ ctx[3] - /*margin*/ ctx[0].right - /*margin*/ ctx[0].left) + " " + /*height*/ ctx[4])) {
    				attr_dev(svg, "viewBox", svg_viewBox_value);
    			}

    			if (dirty & /*width*/ 8) {
    				attr_dev(svg, "width", /*width*/ ctx[3]);
    			}

    			if (dirty & /*height*/ 16) {
    				attr_dev(svg, "height", /*height*/ ctx[4]);
    			}

    			if (dirty & /*radius, nodes*/ 96) {
    				each_value = /*nodes*/ ctx[6];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			destroy_each(each_blocks_3, detaching);
    			destroy_each(each_blocks_2, detaching);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(69:0) {#if width}",
    		ctx
    	});

    	return block;
    }

    // (87:8) {#each links as link}
    function create_each_block_3(ctx) {
    	let path;
    	let path_d_value;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", path_d_value = /*linkPath*/ ctx[9](/*link*/ ctx[22]));
    			attr_dev(path, "stroke", "#abd4ff");
    			attr_dev(path, "opacity", 0.7);
    			attr_dev(path, "stroke-width", "5");
    			attr_dev(path, "fill", "none");
    			attr_dev(path, "marker-end", "url(#arrowhead)");
    			add_location(path, file$3, 87, 2, 2291);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*linkPath, links*/ 640 && path_d_value !== (path_d_value = /*linkPath*/ ctx[9](/*link*/ ctx[22]))) {
    				attr_dev(path, "d", path_d_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(87:8) {#each links as link}",
    		ctx
    	});

    	return block;
    }

    // (99:8) {#each selected as link}
    function create_each_block_2(ctx) {
    	let path;
    	let path_d_value;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "d", path_d_value = /*linkPath*/ ctx[9](/*link*/ ctx[22]));
    			attr_dev(path, "stroke", "#fff");
    			attr_dev(path, "opacity", 1);
    			attr_dev(path, "stroke-width", "5");
    			attr_dev(path, "fill", "none");
    			attr_dev(path, "marker-end", "url(#arrowhead)");
    			add_location(path, file$3, 99, 2, 2545);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*linkPath, selected*/ 768 && path_d_value !== (path_d_value = /*linkPath*/ ctx[9](/*link*/ ctx[22]))) {
    				attr_dev(path, "d", path_d_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(99:8) {#each selected as link}",
    		ctx
    	});

    	return block;
    }

    // (111:8) {#each nodes as node}
    function create_each_block_1(ctx) {
    	let circle;
    	let circle_cx_value;
    	let circle_cy_value;
    	let mounted;
    	let dispose;

    	function mouseover_handler() {
    		return /*mouseover_handler*/ ctx[15](/*node*/ ctx[17]);
    	}

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");
    			attr_dev(circle, "cx", circle_cx_value = /*node*/ ctx[17].cx);
    			attr_dev(circle, "cy", circle_cy_value = /*node*/ ctx[17].cy);
    			attr_dev(circle, "r", /*radius*/ ctx[5]);
    			attr_dev(circle, "stroke", "none");
    			attr_dev(circle, "fill", "#abd4ff");
    			add_location(circle, file$3, 111, 2, 2789);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, circle, anchor);

    			if (!mounted) {
    				dispose = listen_dev(circle, "mouseover", mouseover_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*nodes*/ 64 && circle_cx_value !== (circle_cx_value = /*node*/ ctx[17].cx)) {
    				attr_dev(circle, "cx", circle_cx_value);
    			}

    			if (dirty & /*nodes*/ 64 && circle_cy_value !== (circle_cy_value = /*node*/ ctx[17].cy)) {
    				attr_dev(circle, "cy", circle_cy_value);
    			}

    			if (dirty & /*radius*/ 32) {
    				attr_dev(circle, "r", /*radius*/ ctx[5]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(circle);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(111:8) {#each nodes as node}",
    		ctx
    	});

    	return block;
    }

    // (124:4) {#each nodes as node}
    function create_each_block$2(ctx) {
    	let p;
    	let t_value = /*node*/ ctx[17].source + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "label svelte-1ytwzoe");
    			set_style(p, "width", /*radius*/ ctx[5] * 2 + "px");
    			set_style(p, "top", /*node*/ ctx[17].cy - /*radius*/ ctx[5] / 2 + "px");
    			set_style(p, "left", /*node*/ ctx[17].cx - /*radius*/ ctx[5] + "px");
    			set_style(p, "text-align", "center");
    			add_location(p, file$3, 124, 2, 3062);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*nodes*/ 64 && t_value !== (t_value = /*node*/ ctx[17].source + "")) set_data_dev(t, t_value);

    			if (dirty & /*radius*/ 32) {
    				set_style(p, "width", /*radius*/ ctx[5] * 2 + "px");
    			}

    			if (dirty & /*nodes, radius*/ 96) {
    				set_style(p, "top", /*node*/ ctx[17].cy - /*radius*/ ctx[5] / 2 + "px");
    			}

    			if (dirty & /*nodes, radius*/ 96) {
    				set_style(p, "left", /*node*/ ctx[17].cx - /*radius*/ ctx[5] + "px");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(124:4) {#each nodes as node}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let div_resize_listener;
    	let if_block = /*width*/ ctx[3] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "graphic " + /*layout*/ ctx[10] + " svelte-1ytwzoe");
    			add_render_callback(() => /*div_elementresize_handler*/ ctx[16].call(div));
    			add_location(div, file$3, 67, 0, 1683);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			div_resize_listener = add_resize_listener(div, /*div_elementresize_handler*/ ctx[16].bind(div));
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*width*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			div_resize_listener();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let x;
    	let y;
    	let radius;
    	let _n;
    	let nodes;
    	let links;
    	let selected;
    	let linkPath;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Network", slots, []);
    	let { margin = { top: 50, right: 5, bottom: 20, left: 5 } } = $$props;
    	let { title } = $$props;
    	let { desc } = $$props;
    	let layout = "full";
    	let width, height;

    	// $: path = line()
    	// 	.x(d => x(d[key.x]))
    	// 	.y0(d => y(0))
    	// 	.y1(d => y(d[key.y]))
    	const handleOver = datum => {
    		$$invalidate(8, selected = links.filter(d => d.id === datum.source));
    	};

    	const writable_props = ["margin", "title", "desc"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Network> was created with unknown prop '${key}'`);
    	});

    	const mouseover_handler = node => handleOver(node);

    	function div_elementresize_handler() {
    		width = this.clientWidth;
    		height = this.clientHeight;
    		$$invalidate(3, width);
    		$$invalidate(4, height);
    	}

    	$$self.$$set = $$props => {
    		if ("margin" in $$props) $$invalidate(0, margin = $$props.margin);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("desc" in $$props) $$invalidate(2, desc = $$props.desc);
    	};

    	$$self.$capture_state = () => ({
    		linkVertical,
    		scaleOrdinal: ordinal,
    		scaleLinear: linear,
    		data,
    		extent,
    		group,
    		fade,
    		margin,
    		title,
    		desc,
    		layout,
    		width,
    		height,
    		handleOver,
    		x,
    		y,
    		radius,
    		_n,
    		nodes,
    		links,
    		selected,
    		linkPath
    	});

    	$$self.$inject_state = $$props => {
    		if ("margin" in $$props) $$invalidate(0, margin = $$props.margin);
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("desc" in $$props) $$invalidate(2, desc = $$props.desc);
    		if ("layout" in $$props) $$invalidate(10, layout = $$props.layout);
    		if ("width" in $$props) $$invalidate(3, width = $$props.width);
    		if ("height" in $$props) $$invalidate(4, height = $$props.height);
    		if ("x" in $$props) $$invalidate(12, x = $$props.x);
    		if ("y" in $$props) $$invalidate(13, y = $$props.y);
    		if ("radius" in $$props) $$invalidate(5, radius = $$props.radius);
    		if ("_n" in $$props) $$invalidate(14, _n = $$props._n);
    		if ("nodes" in $$props) $$invalidate(6, nodes = $$props.nodes);
    		if ("links" in $$props) $$invalidate(7, links = $$props.links);
    		if ("selected" in $$props) $$invalidate(8, selected = $$props.selected);
    		if ("linkPath" in $$props) $$invalidate(9, linkPath = $$props.linkPath);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*margin, width*/ 9) {
    			$$invalidate(12, x = linear().domain([1, 25]).range([margin.left, width - margin.left - margin.right]));
    		}

    		if ($$self.$$.dirty & /*margin, height*/ 17) {
    			$$invalidate(13, y = linear().domain(extent(data, d => d.level)).range([margin.top, height - margin.bottom - margin.top]));
    		}

    		if ($$self.$$.dirty & /*width*/ 8) {
    			$$invalidate(5, radius = width / 50);
    		}

    		if ($$self.$$.dirty & /*_n, y, x*/ 28672) {
    			$$invalidate(6, nodes = _n.map(d => {
    				return {
    					source: d.source,
    					cy: y(d.level),
    					cx: x(d.col)
    				};
    			}));
    		}

    		if ($$self.$$.dirty & /*nodes, radius*/ 96) {
    			$$invalidate(7, links = data.map(d => {
    				let source = nodes.find(e => e.source === d.source);
    				let target = nodes.find(e => e.source === d.target);

    				if (target) {
    					return {
    						id: source.source,
    						source: [source.cx, source.cy + radius],
    						target: [target.cx, target.cy - radius - 10]
    					};
    				}
    			}).filter(d => d !== undefined));
    		}

    		if ($$self.$$.dirty & /*links*/ 128) {
    			$$invalidate(8, selected = links);
    		}
    	};

    	$$invalidate(14, _n = [...new Set(data.map(d => d.source))].map(d => data.find(e => e.source === d)));
    	$$invalidate(9, linkPath = linkVertical().source(d => d.source).target(d => d.target));

    	return [
    		margin,
    		title,
    		desc,
    		width,
    		height,
    		radius,
    		nodes,
    		links,
    		selected,
    		linkPath,
    		layout,
    		handleOver,
    		x,
    		y,
    		_n,
    		mouseover_handler,
    		div_elementresize_handler
    	];
    }

    class Network extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { margin: 0, title: 1, desc: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Network",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[1] === undefined && !("title" in props)) {
    			console.warn("<Network> was created without expected prop 'title'");
    		}

    		if (/*desc*/ ctx[2] === undefined && !("desc" in props)) {
    			console.warn("<Network> was created without expected prop 'desc'");
    		}
    	}

    	get margin() {
    		throw new Error("<Network>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set margin(value) {
    		throw new Error("<Network>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get title() {
    		throw new Error("<Network>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Network>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get desc() {
    		throw new Error("<Network>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set desc(value) {
    		throw new Error("<Network>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/text/Credits.svelte generated by Svelte v3.38.2 */

    const file$2 = "src/components/text/Credits.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let p0;
    	let t0;
    	let p1;
    	let t1;
    	let p2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			t0 = space();
    			p1 = element("p");
    			t1 = space();
    			p2 = element("p");
    			attr_dev(p0, "class", "byline svelte-1dqbfhm");
    			add_location(p0, file$2, 7, 4, 127);
    			attr_dev(p1, "class", "byline small svelte-1dqbfhm");
    			add_location(p1, file$2, 8, 4, 168);
    			attr_dev(p2, "class", "byline small svelte-1dqbfhm");
    			add_location(p2, file$2, 9, 4, 213);
    			attr_dev(div, "class", "credits col-text svelte-1dqbfhm");
    			add_location(div, file$2, 6, 0, 92);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			p0.innerHTML = /*byline*/ ctx[2];
    			append_dev(div, t0);
    			append_dev(div, p1);
    			p1.innerHTML = /*date*/ ctx[1];
    			append_dev(div, t1);
    			append_dev(div, p2);
    			p2.innerHTML = /*award*/ ctx[0];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*byline*/ 4) p0.innerHTML = /*byline*/ ctx[2];			if (dirty & /*date*/ 2) p1.innerHTML = /*date*/ ctx[1];			if (dirty & /*award*/ 1) p2.innerHTML = /*award*/ ctx[0];		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Credits", slots, []);
    	let { award } = $$props;
    	let { date } = $$props;
    	let { byline } = $$props;
    	let { update } = $$props;
    	const writable_props = ["award", "date", "byline", "update"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Credits> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("award" in $$props) $$invalidate(0, award = $$props.award);
    		if ("date" in $$props) $$invalidate(1, date = $$props.date);
    		if ("byline" in $$props) $$invalidate(2, byline = $$props.byline);
    		if ("update" in $$props) $$invalidate(3, update = $$props.update);
    	};

    	$$self.$capture_state = () => ({ award, date, byline, update });

    	$$self.$inject_state = $$props => {
    		if ("award" in $$props) $$invalidate(0, award = $$props.award);
    		if ("date" in $$props) $$invalidate(1, date = $$props.date);
    		if ("byline" in $$props) $$invalidate(2, byline = $$props.byline);
    		if ("update" in $$props) $$invalidate(3, update = $$props.update);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [award, date, byline, update];
    }

    class Credits extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { award: 0, date: 1, byline: 2, update: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Credits",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*award*/ ctx[0] === undefined && !("award" in props)) {
    			console.warn("<Credits> was created without expected prop 'award'");
    		}

    		if (/*date*/ ctx[1] === undefined && !("date" in props)) {
    			console.warn("<Credits> was created without expected prop 'date'");
    		}

    		if (/*byline*/ ctx[2] === undefined && !("byline" in props)) {
    			console.warn("<Credits> was created without expected prop 'byline'");
    		}

    		if (/*update*/ ctx[3] === undefined && !("update" in props)) {
    			console.warn("<Credits> was created without expected prop 'update'");
    		}
    	}

    	get award() {
    		throw new Error("<Credits>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set award(value) {
    		throw new Error("<Credits>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get date() {
    		throw new Error("<Credits>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set date(value) {
    		throw new Error("<Credits>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get byline() {
    		throw new Error("<Credits>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set byline(value) {
    		throw new Error("<Credits>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get update() {
    		throw new Error("<Credits>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set update(value) {
    		throw new Error("<Credits>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/multimedia/Grid.svelte generated by Svelte v3.38.2 */
    const file$1 = "src/components/multimedia/Grid.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[6] = list;
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (17:8) {#each videos as v,i}
    function create_each_block$1(ctx) {
    	let div;
    	let h4;
    	let t0_value = /*v*/ ctx[5].header + "";
    	let t0;
    	let t1;
    	let video;
    	let i = /*i*/ ctx[7];
    	let t2;
    	let current;
    	const assign_video = () => /*video_binding*/ ctx[4](video, i);
    	const unassign_video = () => /*video_binding*/ ctx[4](null, i);

    	let video_props = {
    		src: /*v*/ ctx[5].src,
    		captions: /*v*/ ctx[5].captions,
    		controls: "controls",
    		scroll: "false",
    		audible,
    		active: /*active*/ ctx[3]
    	};

    	video = new Video({ props: video_props, $$inline: true });
    	assign_video();

    	const block = {
    		c: function create() {
    			div = element("div");
    			h4 = element("h4");
    			t0 = text(t0_value);
    			t1 = space();
    			create_component(video.$$.fragment);
    			t2 = space();
    			attr_dev(h4, "class", "title svelte-mom57m");
    			add_location(h4, file$1, 18, 12, 429);
    			attr_dev(div, "class", "" + (null_to_empty(layout) + " svelte-mom57m"));
    			add_location(div, file$1, 17, 8, 394);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h4);
    			append_dev(h4, t0);
    			append_dev(div, t1);
    			mount_component(video, div, null);
    			append_dev(div, t2);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*videos*/ 1) && t0_value !== (t0_value = /*v*/ ctx[5].header + "")) set_data_dev(t0, t0_value);

    			if (i !== /*i*/ ctx[7]) {
    				unassign_video();
    				i = /*i*/ ctx[7];
    				assign_video();
    			}

    			const video_changes = {};
    			if (dirty & /*videos*/ 1) video_changes.src = /*v*/ ctx[5].src;
    			if (dirty & /*videos*/ 1) video_changes.captions = /*v*/ ctx[5].captions;
    			video.$set(video_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(video.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(video.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			unassign_video();
    			destroy_component(video);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(17:8) {#each videos as v,i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let section_1;
    	let current;
    	let each_value = /*videos*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			section_1 = element("section");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(section_1, "class", "" + (section + " visible" + " svelte-mom57m"));
    			attr_dev(section_1, "id", /*id*/ ctx[1]);
    			add_location(section_1, file$1, 15, 4, 315);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section_1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(section_1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*layout, videos, audible, active, vids*/ 13) {
    				each_value = /*videos*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(section_1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*id*/ 2) {
    				attr_dev(section_1, "id", /*id*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section_1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const layout = "mini grid-item";
    const section = "wide grid";
    const audible = true;

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Grid", slots, []);
    	let { videos } = $$props;
    	let { id } = $$props;
    	let vids = [];
    	let active = true;
    	const writable_props = ["videos", "id"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Grid> was created with unknown prop '${key}'`);
    	});

    	function video_binding($$value, i) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			vids[i] = $$value;
    			$$invalidate(2, vids);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("videos" in $$props) $$invalidate(0, videos = $$props.videos);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    	};

    	$$self.$capture_state = () => ({
    		IntersectionObserver: IntersectionObserver_1,
    		Video,
    		videos,
    		id,
    		layout,
    		section,
    		audible,
    		vids,
    		active
    	});

    	$$self.$inject_state = $$props => {
    		if ("videos" in $$props) $$invalidate(0, videos = $$props.videos);
    		if ("id" in $$props) $$invalidate(1, id = $$props.id);
    		if ("vids" in $$props) $$invalidate(2, vids = $$props.vids);
    		if ("active" in $$props) $$invalidate(3, active = $$props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [videos, id, vids, active, video_binding];
    }

    class Grid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { videos: 0, id: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Grid",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*videos*/ ctx[0] === undefined && !("videos" in props)) {
    			console.warn("<Grid> was created without expected prop 'videos'");
    		}

    		if (/*id*/ ctx[1] === undefined && !("id" in props)) {
    			console.warn("<Grid> was created without expected prop 'id'");
    		}
    	}

    	get videos() {
    		throw new Error("<Grid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set videos(value) {
    		throw new Error("<Grid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Grid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Grid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.38.2 */

    const { Object: Object_1 } = globals;
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (55:6) {:else}
    function create_else_block(ctx) {
    	let div;
    	let t0;
    	let t1_value = /*block*/ ctx[10].type + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("Ups, falta el component '");
    			t1 = text(t1_value);
    			t2 = text("'");
    			add_location(div, file, 55, 8, 1660);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*content*/ 1 && t1_value !== (t1_value = /*block*/ ctx[10].type + "")) set_data_dev(t1, t1_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(55:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (49:6) {#if components[block.type]}
    function create_if_block(ctx) {
    	let switch_instance;
    	let updating_chapter;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*block*/ ctx[10]];

    	function switch_instance_chapter_binding(value) {
    		/*switch_instance_chapter_binding*/ ctx[9](value);
    	}

    	var switch_value = /*components*/ ctx[4][/*block*/ ctx[10].type];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		if (/*chapter*/ ctx[2] !== void 0) {
    			switch_instance_props.chapter = /*chapter*/ ctx[2];
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props(ctx));
    		binding_callbacks.push(() => bind(switch_instance, "chapter", switch_instance_chapter_binding));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*content*/ 1)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*block*/ ctx[10])])
    			: {};

    			if (!updating_chapter && dirty & /*chapter*/ 4) {
    				updating_chapter = true;
    				switch_instance_changes.chapter = /*chapter*/ ctx[2];
    				add_flush_callback(() => updating_chapter = false);
    			}

    			if (switch_value !== (switch_value = /*components*/ ctx[4][/*block*/ ctx[10].type])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					binding_callbacks.push(() => bind(switch_instance, "chapter", switch_instance_chapter_binding));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(49:6) {#if components[block.type]}",
    		ctx
    	});

    	return block;
    }

    // (48:4) {#each content as block}
    function create_each_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*components*/ ctx[4][/*block*/ ctx[10].type]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(48:4) {#each content as block}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let scrolling = false;

    	let clear_scrolling = () => {
    		scrolling = false;
    	};

    	let scrolling_timeout;
    	let main;
    	let article;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowscroll*/ ctx[8]);
    	let each_value = /*content*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			main = element("main");
    			article = element("article");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(article, "class", /*bg*/ ctx[3]);
    			add_location(article, file, 46, 2, 1432);
    			add_location(main, file, 45, 0, 1423);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, article);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(article, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "scroll", () => {
    					scrolling = true;
    					clearTimeout(scrolling_timeout);
    					scrolling_timeout = setTimeout(clear_scrolling, 100);
    					/*onwindowscroll*/ ctx[8]();
    				});

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*y*/ 2 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo(window.pageXOffset, /*y*/ ctx[1]);
    				scrolling_timeout = setTimeout(clear_scrolling, 100);
    			}

    			if (dirty & /*components, content, chapter*/ 21) {
    				each_value = /*content*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(article, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*bg*/ 8) {
    				attr_dev(article, "class", /*bg*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let currentChapter;
    	let currentChapterId;
    	let bg;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { content } = $$props, { meta } = $$props;
    	let y;
    	let chapter = {};

    	const components = {
    		intro: Intro,
    		text: Text,
    		video: InterviewVideo,
    		chapter: Chapter,
    		"chapter-video": ChapterVideo,
    		notes: Notes,
    		quote: Quote,
    		network: Network,
    		grid: Grid,
    		"spiral-violence": SpiralViolence,
    		credits: Credits
    	};

    	const writable_props = ["content", "meta"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function onwindowscroll() {
    		$$invalidate(1, y = window.pageYOffset);
    	}

    	function switch_instance_chapter_binding(value) {
    		chapter = value;
    		$$invalidate(2, chapter);
    	}

    	$$self.$$set = $$props => {
    		if ("content" in $$props) $$invalidate(0, content = $$props.content);
    		if ("meta" in $$props) $$invalidate(5, meta = $$props.meta);
    	};

    	$$self.$capture_state = () => ({
    		Intro,
    		Text,
    		Chapter,
    		ChapterVideo,
    		InterviewVideo,
    		Notes,
    		Quote,
    		SpiralViolence,
    		Network,
    		Credits,
    		Grid,
    		content,
    		meta,
    		y,
    		chapter,
    		components,
    		currentChapter,
    		currentChapterId,
    		bg
    	});

    	$$self.$inject_state = $$props => {
    		if ("content" in $$props) $$invalidate(0, content = $$props.content);
    		if ("meta" in $$props) $$invalidate(5, meta = $$props.meta);
    		if ("y" in $$props) $$invalidate(1, y = $$props.y);
    		if ("chapter" in $$props) $$invalidate(2, chapter = $$props.chapter);
    		if ("currentChapter" in $$props) $$invalidate(6, currentChapter = $$props.currentChapter);
    		if ("currentChapterId" in $$props) $$invalidate(7, currentChapterId = $$props.currentChapterId);
    		if ("bg" in $$props) $$invalidate(3, bg = $$props.bg);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*chapter, y*/ 6) {
    			$$invalidate(6, currentChapter = Object.values(chapter).findIndex(d => d.pos > y + 200));
    		}

    		if ($$self.$$.dirty & /*currentChapter, chapter*/ 68) {
    			$$invalidate(7, currentChapterId = currentChapter === -1
    			? Object.values(chapter).length - 1
    			: currentChapter <= 1 ? 0 : currentChapter - 1);
    		}

    		if ($$self.$$.dirty & /*chapter, currentChapterId*/ 132) {
    			$$invalidate(3, bg = Object.values(chapter)[currentChapterId]
    			? Object.values(chapter)[currentChapterId].id
    			: "miedo");
    		}
    	};

    	return [
    		content,
    		y,
    		chapter,
    		bg,
    		components,
    		meta,
    		currentChapter,
    		currentChapterId,
    		onwindowscroll,
    		switch_instance_chapter_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { content: 0, meta: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*content*/ ctx[0] === undefined && !("content" in props)) {
    			console.warn("<App> was created without expected prop 'content'");
    		}

    		if (/*meta*/ ctx[5] === undefined && !("meta" in props)) {
    			console.warn("<App> was created without expected prop 'meta'");
    		}
    	}

    	get content() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set content(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get meta() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set meta(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var article = [
    	{
    		type: "intro",
    		id: "intro",
    		parts: [
    			{
    				video: "00_intro_loop_marc",
    				poster: "00_intro_marc.jpg",
    				p: "Amb tres anys, en Marc va presenciar com el seu pare va estar a punt d’assassinar la mare."
    			},
    			{
    				video: "00_intro_marc",
    				poster: "00_intro_loop_lola.jpg",
    				p: "Escolta la història d’en Marc"
    			},
    			{
    				video: "00_intro_loop_lola",
    				poster: "00_intro_lola.jpg",
    				p: "Lola ha passat la infantesa en centres d’acollida. Durant l’adolescència va ser víctima de violència masclista fins que va aconseguir alliberar-se."
    			},
    			{
    				video: "00_intro_lola",
    				poster: "00_intro_loop_alba.jpg",
    				p: "Aquest és el seu testimoni"
    			},
    			{
    				video: "00_intro_loop_alba",
    				poster: "00_intro_alba.jpg",
    				p: "L’Alba va lluitar desesperadament perquè es reconeguessin els abusos sexuals que la seva filla va patir als cinc anys"
    			},
    			{
    				video: "00_intro_alba",
    				poster: "00_intro_alba.jpg",
    				p: "Escolta la història de l’Alba"
    			},
    			{
    				video: "00_intro_loop_alba",
    				poster: "00_intro_alba.jpg",
    				p: "Aquest reportatge explora el patiment dels infants quan són víctimes de maltractaments psicològics, físics i abusos sexuals dins de l’entorn familiar. La violència masclista és, sovint, el detonant. <br/> <br/><span class=\"respecte\">Per respecte als testimonis, els seus noms s’han canviat i les veus estan distorsionades.</span>"
    			},
    			{
    				video: "00_intro_loop_alba",
    				poster: "00_intro_alba.jpg",
    				p: "Tres històries d'entre milers …"
    			},
    			{
    				video: "00_intro_loop_alba",
    				poster: "00_intro_alba.jpg",
    				p: "Infància (des)protegida"
    			}
    		]
    	},
    	{
    		type: "credits",
    		date: "9 de juny de 2022",
    		update: "",
    		byline: "Por Karma Peiró, Rocío Minvielle, Francina Cortés i Xaquín G.V.",
    		award: "Premi Montserrat Roig 2019, atorgat per l’Ajuntament de Barcelona"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Després de vuit mesos d'investigació podem confirmar que l'anàlisi de dades sobre maltractaments i abusos sexuals als menors, les peticions d'informació pública, les entrevistes a una trentena de professionals i la documentació publicada demostren que és urgent un canvi en l'abordatge de les violències cap als infants."
    			},
    			{
    				p: "La llei 8/2021 de Protecció a la Infància i Adolescència s'està incomplint perquè hi ha..."
    			}
    		],
    		list: [
    			"Saturació dels serveis assistencials amb llistes d’espera de mesos",
    			"Precarització laboral del personal que atén els infants",
    			"Processos legals que duren 3 anys de mitjana",
    			"Sentències adultocèntriques que posen en risc els menors",
    			"Excés de protocols i molta confusió sobre les actuacions a seguir",
    			"Falten dades dels serveis i avaluacions públiques per prendre decisions",
    			"Manca de formació amb perspectiva de gènere en l’àmbit de la salut, educació i justícia"
    		]
    	},
    	{
    		type: "text",
    		dropcap: "null",
    		text: [
    			{
    				p: "Actualment, el sistema públic falla en la <b>detecció, atenció i prevenció</b> de casos de maltractaments i abusos sexuals a menors. El <a href=\"https://dretssocials.gencat.cat/web/.content/01departament/05plansactuacio/Infancia_i_adolescencia/Pla_Accio_Millora_Sistema_Atencio.pdf\" target=\"_blank\">Pla de millora </a> del govern català ja ho reconeixia el 2020, on es proposaven 154 mesures urgents a abordar."
    			}
    		]
    	},
    	{
    		type: "spiral-violence",
    		header: "",
    		text: [
    			{
    				data: "4",
    				range: "180",
    				head: "Slide head",
    				p: "Infants assassinats per violència domèstica i masclista a Catalunya el 2021"
    			},
    			{
    				data: "2359",
    				range: "80",
    				head: "Slide head",
    				p: "Denúncies per maltractament i violència cap als menors"
    			},
    			{
    				data: "5928",
    				range: "64",
    				head: "Slide head",
    				p: "Víctimes de violència domèstica a menors i adolescents ateses pels Mossos"
    			},
    			{
    				data: "11365",
    				range: "32",
    				head: "Slide head",
    				p: "Trucades al Telèfon Infància Respon 116 111"
    			},
    			{
    				data: "16579",
    				range: "28",
    				head: "Slide head",
    				p: "Casos tutelats per la DGAIA a finals de 2021"
    			},
    			{
    				data: "45078",
    				range: "20",
    				head: "Slide head",
    				p: "Menors maltractats que viuen a cases on la mare pateix violència física o sexual"
    			},
    			{
    				data: "87338",
    				range: "20",
    				head: "Slide head",
    				p: "Estimació dels menors maltractats física i sexualment a Catalunya el 2021"
    			}
    		]
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Cada any, milers d'infants i adolescents són víctimes de maltractaments físics i abusos sexuals per part dels seus progenitors o familiars propers. No se’ls permet alçar la veu per demanar ajuda i la majoria de vegades se’ls silencia. Únicament es coneix <a ref=\"https://www.savethechildren.es/sites/default/files/imce/docs/sota-el-mateix-sostre-web-doble.pdf\" target=\"_blank\">la punta de l’iceberg</a>, els casos més greus. Però el rerefons és molt més enrevessat, on s’amaguen la majoria dels abusos que mai surten a la llum."
    			}
    		]
    	},
    	{
    		type: "quote",
    		attribution: "<a href=\"https://www.boe.es/buscar/act.php?id=BOE-A-2021-9347\" target=\"_blank\">Llei 8/2021, de protecció integral a la infància i l’adolescència</a>",
    		quote: [
    			{
    				p: "“S'entendrà per violència als menors el maltractament físic, psicològic, tracte negligent, amenaces, la violència sexual, la pornografia infantil, la prostitució, l'assetjament escolar i sexual, la violència de gènere, la mutilació genital, el tràfic de persones, el matrimoni infantil, la difusió pública de dades privades i la presència de qualsevol comportament violent en el seu àmbit familiar\"."
    			}
    		]
    	},
    	{
    		type: "chapter",
    		id: "por",
    		src: "por_chapter",
    		header: "Por"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Fer una radiografia del maltractament infantil avui a Catalunya és encara una missió impossible: bona part dels fets passen en l’entorn familiar i no es denuncien. A banda, les dades que es publiquen són parcials o recollides amb diferents criteris, fent molt complicat calcular la quantitat real d’afectats."
    			},
    			{
    				p: "El <a href=\"https://www.congress-1in5.eu/en/\" target=\"_blank\">Consell d’Europa estima</a>que un de cada cinc menors són abusats sexualment, i que entre el 70 i 85% pateixen maltractament per part d’un familiar."
    			}
    		]
    	},
    	{
    		type: "video",
    		src: "01_miedo_1_7",
    		header: "En Marc es posa molt nerviós quan li toca anar al punt de trobada",
    		size: "full"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "A Catalunya, unes 200 mil dones viuen fets greus de violència masclista cada any. D’elles, aproximadament la meitat tenen filles i fills menors d’edat. Un 32% manifesta que els infants han estat presents –de manera continuada- durant els actes violents, rebent un impacte psicològic per a la resta de les seves vides."
    			}
    		]
    	},
    	{
    		type: "video",
    		src: "01_miedo_2_7",
    		header: "Tània Verge, Consellera d’igualtat i feminismes",
    		size: "small"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Amb violència masclista a la llar, els menors són dependents d’un sistema judicial obsolet i poc coherent. S’empara la figura paterna per sobre de tot, i s’obligua els infants a trobar-se assíduament amb els maltractadors."
    			}
    		]
    	},
    	{
    		type: "video",
    		src: "01_miedo_3_7",
    		header: "Un any que va ser un infern, sense saber què fer...",
    		size: "full"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "La violència sexual que pateixen els infants és perpetrada per homes en un 98% i les víctimes són majoritàriament noies (72%). Els agressors són de l'àmbit familiar i del seu entorn. Els fets es cometen de forma reiterada en un 70% dels casos. No obstant això, els informes psicològics forenses valoren més si el relat del menor és cert que els danys patits. Segons l'ONU, les seqüeles més comunes després d'una agressió sexual en la infància són depressió, dependència d'alcohol o drogues, intents de suïcidi, trastorns de pànic o estrès posttraumàtic."
    			},
    			{
    				p: "7 de cada 10 casos denunciats no arriben a judici. Dels que entren al sistema judicial, la majoria acaben sense condemna per manca de proves. Llavors, s'obliga a l'infant a veure l'agressor en règim obert o en Punts de Trobada."
    			},
    			{
    				p: "El codi penal contempla presó de cinc a deu anys per agressions sexuals a infants; però només en un 14% dels casos el culpable ingressa a presó, segons l'anàlisi de sentències d'una dècada."
    			}
    		]
    	},
    	{
    		type: "video",
    		src: "01_miedo_4_7",
    		header: "Carla Vall, advocada penalista i criminòloga",
    		size: "small"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Des de ben petita, Lola s’ha de fer càrrec del seu germanet. Rep les mínimes explicacions dels adults desconeguts que els atenen, i no entén molt bé perquè les seves vides canvien radicalment."
    			}
    		]
    	},
    	{
    		type: "video",
    		src: "01_miedo_5_7",
    		header: "Els adults desconeguts no s’expliquen bé i no entenia...",
    		size: "full"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Al centre els diuen que només hi seran sis mesos, però parlant amb altres infants descobreixen que és l’explicació habitual que poques vegades es compleix."
    			}
    		]
    	},
    	{
    		type: "video",
    		src: "01_miedo_6_7",
    		header: "Ester Cabanes, directora general d'Atenció a la Infància i l'Adolescència (DGAIA)",
    		size: "small"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Si després de ser abusat o maltractat, cap familiar es fa càrrec de l'infant aquest acaba invisibilitzat en centres d'acollida. La protecció de l'administració pública els fa més vulnerables perquè acaben institucionalitzats i amb molta dependència d'uns serveis que es cronifiquen en el temps."
    			}
    		]
    	},
    	{
    		type: "video",
    		src: "01_miedo_7_7",
    		header: "Lola",
    		size: "full"
    	},
    	{
    		type: "chapter",
    		header: "Violència institucional",
    		id: "violencia",
    		src: "violencia_chapter"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Amb 15 anys, separen a Lola del seu germà i la destinen a un centre religiós. Ella no s'adapta i és expulsada poc temps després. L'administració li promet un lloc en un altre centre, però en l'espera no li dona cap altre recurs. Un amic li ofereix casa seva temporalment."
    			}
    		]
    	},
    	{
    		type: "video",
    		src: "02_violencia_1_4",
    		header: "Lola",
    		size: "full"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "L'amic és dotze anys més gran que Lola i al cap de poc es veu immersa en una relació de parella tòxica, amb episodis greus de violència masclista. Acaba diverses vegades en urgències d'hospitals, però, sent menor i sense diners, no troba cap altra sortida."
    			}
    		]
    	},
    	{
    		type: "video",
    		src: "02_violencia_2_4",
    		header: "Maria Jesús Larios, adjunta Defensa dels Drets dels Infants i Adolescents del Síndic",
    		size: "small"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Des del Síndic de Greuges es denuncien greus mancances per detectar i denunciar la violència que pateixen els infants, així com falta de recursos per atendre problemàtiques com la que relata Lola. \"Cal canviar radicalment les estructures i fer front a les seves necessitats en una societat cada vegada més complexa\", explicita al darrer informe anual."
    			}
    		]
    	},
    	{
    		type: "video",
    		src: "02_violencia_3_4",
    		header: "Alba",
    		size: "full"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "El cas d'Alba recorda <a href=\"https://www.publico.es/sociedad/onu-pide-explicaciones-espana-sindrome-alienacion-parental-desproteger-madre-hija.html\" target=\"_blank\">al de Diana Garcia</a> –una altra mare que va intentar desesperadament que la creguessin quan intentava protegir la seva filla–. Arran de les seves denúncies reiterades, l'ONU va exigir al govern espanyol explicacions del perquè la justícia havia aplicat la falsa síndrome d'Alineació Parental (SAP), ignorant el relat dels abusos sexuals que el pare havia perpetrat. Des del 2020, a Catalunya el SAP es considera una forma de violència institucional, tot i que encara hi ha marge per aplicar-se de manera encoberta."
    			}
    		]
    	},
    	{
    		type: "video",
    		src: "02_violencia_4_4",
    		header: "Lucía Avilés, magistrada del Jutjat Penal núm. 2 a Mataró",
    		size: "small"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Si les visites amb l'agressor continuen, els infants corren risc de ser víctimes de violència vicària, és a dir, quan es fa mal als fills per veure patir la mare. Sovint lamentem les morts dels menors en aquestes situacions, però molt abans hi ha un maltractament reiterat que es podria haver detectat."
    			},
    			{
    				p: "Un pas més en el dret de les dones a Catalunya ha estat <a href=\"https://web.gencat.cat/ca/actualitat/detall/Decret-llei-de-la-violencia-vicaria\" target=\"_blank\">el decret llei de la Violència Vicària </a>, que des de finals del 2021 prohibeix als progenitors apropar-se o comunicar-se amb els infants quan hi ha hagut violència masclista o domèstica. Però el decret no s'aplica en les sentències dictades del passat. <a href=\"https://www.ccma.cat/tv3/alacarta/els-matins/el-parlament-aprova-el-decret-llei-contra-la-violencia-vicaria/video/6136018/\" target=\"_blank\">Lucia Avilés recorda </a>que abans ja existien mesures jurídiques per a protegir els menors; no obstant això, els jutges no sempre les apliquen. La directora general d'Igualtat i Feminismes de la Generalitat, Laia Rosich afegeix: \"Sabem que serà molt difícil d'aplicar el decret. Ens enfrontem a un 'monstre'; així i tot, davant d'indicis de violència s'ha de protegir a l'infant\"."
    			}
    		]
    	},
    	{
    		type: "chapter",
    		id: "oblit",
    		src: "oblit_chapter",
    		header: "Oblit"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "El darrer <a href=\"https://www.sindic.cat/site/unitFiles/8326/Informe%20Infancia%202021_def.pdf\" target=\"_blank\"> informe del Síndic de Greuges </a>denuncia que no es pot permetre que hi hagi infants que passin bona part de la seva infantesa i adolescència en centres d’acollida, relegats a l’oblit. “Catalunya normalitza l’internament, quan les normes internacionals, la comunitat científica i les institucions de defensa de drets dels infants fa dècades que advertim que no és la mesura més adequada\", explicita el document."
    			}
    		]
    	},
    	{
    		type: "video",
    		src: "03_olvido_1_7",
    		header: "Lola",
    		size: "full"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "L'infant que ha crescut en un centre està en una bombolla, sense xarxes socials i amb molt poques oportunitats de gaudir d'extraescolars. Acaben adoptant un vocabulari de la institució, que els marca de per vida i que no entén ningú de fora. 'M'han fet la devolutiva' (per saber on han de marxar), 'm'han deixat un dia fora de dinàmica'(un càstig), 'tinc un permís personal'(sortir al carrer a fer un volt), 'vull parlar amb el meu tècnic o referent' (tutor o persona que porta el seu cas), o 'fer una contenció física'(quan algú demostra agressivitat). Això tanca més el cercle, i la vida d'aquests infants es redueix únicament al que passa dins de les parets del centre."
    			}
    		]
    	},
    	{
    		type: "video",
    		src: "03_olvido_2_7",
    		header: "Maria Jesús Larios, adjunta defensa drets infants i adolescents del Síndic de Greuges",
    		size: "small"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Amb aquest esquema es vol mostrar la quantitat de recursos públics disponibles del sistema català per detectar, atendre i preveure el maltractament i abús infantil."
    			},
    			{
    				p: "Hi ha poques denúncies per part d’infants i adolescents que pateixen situacions de violència, principalment perquè no tenen informació dels canals que poden utilitzar presencialment, telefònicament o telemàticament."
    			}
    		]
    	},
    	{
    		type: "network"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Quan es detecta un cas es posen en marxa els protocols d'actuació des de salut, policia, escola o serveis socials. El serveis són nombrosos i molt valuosos; no obstant això, els testimonis entrevistats expliciten greus mancances de coordinació entre administracions i falta d'eficiència."
    			},
    			{
    				p: "Els infants són els que pateixen les conseqüències."
    			}
    		]
    	},
    	{
    		type: "video",
    		src: "03_olvido_3_7",
    		header: "Maria Jesús Larios, adjunta defensa drets infants i adolescents del Síndic de Greuges",
    		size: "small"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Per al menor no resulta senzill entendre qui actua en cada moment, ni perquè adults desconeguts li pregunten pels mateixos fets repetidament. De mitjana, <a href=\"https://www.savethechildren.es/sites/default/files/imce/docs/sota-el-mateix-sostre-web-doble.pdf\" target=\"_blank\">un menor explica el seu abús unes 10 </a>vegades al llarg de tres anys."
    			},
    			{
    				p: "Segons <a href=\"https://www.savethechildren.es/sites/default/files/imce/docs/sota-el-mateix-sostre-web-doble.pdf\" target=\"_blank\">el darrer informe de Save the Children</a>, \"sovint els professionals no coneixen l'existència dels protocols que han d'aplicar, ni els passos a seguir si tenen sospita que un nen o una nena pot estar patint abús sexual\"."
    			}
    		]
    	},
    	{
    		type: "video",
    		src: "03_olvido_4_7",
    		header: "Carla Vall, advocada penalista i criminòloga",
    		size: "small"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "A les escoles hi ha mancances per fer la detecció i atenció:, \"El protocol d'Ensenyament per a mi és fred, deshumanitzat i sense suport a la víctima\", es queixa <b>Sílvia Viladrich</b>, educadora en un institut de secundària d'alta complexitat. \"Tens a la noia o noi que s'ha atrevit a parlar, a denunciar, amb una angoixa que no t'ho pots imaginar. I què fas? En el moment que la víctima verbalitza els fets violents, no hi ha personal especialitzat extern per protegir-lo. Se'l deriva als serveis, però aquests estan col·lapsats i torna a casa amb l'agressor a l'espera que en dues setmanes o més se la pugui atendre. Molta més transparència, molta més coordinació, si us plau\", reclama."
    			}
    		]
    	},
    	{
    		type: "video",
    		src: "03_olvido_5_7",
    		header: "Alba",
    		size: "full"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "El 2011 el govern català va aprovar el decret pel funcionament dels Serveis Tècnics de Punts de Trobada (STPT) definits \"per normalitzar la relació i comunicació dels menors amb els seus progenitors en situacions de conflictivitat\"."
    			},
    			{
    				p: "La decisió que el menor vagi al punt de trobada és per resolució judicial o un òrgan competent –com ara la DGAIA–. Els infants són obligats a trobar-se una hora cada quinze dies amb el seu progenitor, inclús en casos on l'adult els ha maltractat, abusat sexualment d'ells o quan ha exercit violència masclista a la mare. Molts menors, quan s'apropa el dia de la visita, sovint tenen atacs d'ansietat o altres trastorns psicològics de manera reiterada."
    			},
    			{
    				p: "\"Malauradament, des de la judicatura encara hi ha molt de temor a trencar, almenys cautelarment, les relacions paterno-filials, malgrat que existeixin evidències clares de violència de gènere. Es continua pensant que un maltractador pot ser un bon pare\", afegeix la magistrada Lucía Avilés. I la directora general de la conselleria d'Igualtat i Feminismes explica que \"la potestat parental és el nucli del dret civil, del patriarcat. I que els drets de les dones i els de la infància tenen encara un recorregut molt curt\"."
    			},
    			{
    				p: "En el <a href=\"https://www.icab.cat/export/sites/icab/.galleries/documents-contingut-generic/Relatores-I-Congreso-Infancia-Adolescencia-2021-1.pdf\" target=\"_blank\">primer Congrés de la Infància i Adolescència</a> –organitzat en 2021, pel Col·legi  de l'Advocacia de Barcelona– es va manifestar que “els Punts de Trobada no compten amb psicòlegs o psiquiatres especialitzats observant la visita com per realitzar un informe per deduir si existeixen indicis d’abusos\". I que com el servei s’ofereix en caps de setmana “hi ha pocs professionals que vulguin fer aquesta funció, que tampoc està ben remunerada\"."
    			}
    		]
    	},
    	{
    		type: "video",
    		src: "03_olvido_6_7",
    		header: "Sergi Torras, sergent de la Unitat de Menors dels Mossos",
    		size: "small"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Com passa amb les dones que pateixen fets de violència masclista, falten recursos per atendre els infants víctimes de maltractaments i abusos sexuals. La lentitud de la resposta assistencial –per burocratització administrativa o falta de personal especialitzat–, i les llistes d'espera són la tònica."
    			},
    			{
    				p: "El Centre de Salut Mental Infantil i Juvenil (CSMIJ) –on es deriven les víctimes– va desbordat i pot trigar mesos a donar hora. La pedagoga Sílvia Viladrich, puntualitza que a les llistes d'espera hi ha el problema afegit que \"es demana que l'infant vagi acompanyat d'un familiar. Però si l'agressor és a casa, no el portaran al centre\"."
    			},
    			{
    				p: "El sistema reconeix que falla i això provoca un segon trauma a les víctimes. Els casos denunciats s'han doblat en la darrera dècada, però els processos legals tenen una espera de mitjana de tres anys. Si els fets passen en una part del territori allunyada de les grans ciutats, on hi ha menys recursos, les solucions es dilaten encara més en el temps."
    			}
    		]
    	},
    	{
    		type: "video",
    		src: "03_olvido_7_7",
    		header: "Marta Simó, directora de la UFAM de l’Hospital St. Joan de Déu",
    		size: "small"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Des de mitjans del 2020 existeix a Tarragona el projecte pilot <a href=\"https://dretssocials.gencat.cat/ca/ambits_tematics/infancia_i_adolescencia/proteccio_a_la_infancia_i_ladolescencia/barnahus/\" target=\"_blank\">Barnahus</a>, basat en el model islandès d'atenció als menors. Consisteix a fer anar les víctimes d'abusos sexuals i maltractaments a un únic lloc, per evitar-los reviure l'abús. És també una forma d'agilitzar l'assistència. Se li pren declaració una sola vegada per circuit tancat de televisió – amb una càmera Gessel–. L'infant parla amb psicòlegs, però pot ser vist i escoltat per la comitiva judicial i per altres serveis assistencials."
    			},
    			{
    				p: "Des del seu inici, la Barnahus de Tarragona ha atès 363 menors. La Generalitat té previst crear-ne 13 repartides per totes les vegueries."
    			}
    		]
    	},
    	{
    		type: "chapter",
    		id: "resiliencia",
    		src: "resilencia_chapter",
    		header: "Resiliència"
    	},
    	{
    		type: "video",
    		src: "04_resiliencia_1_10",
    		header: "Lola",
    		size: "full"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "El <a href=\"https://www.youtube.com/watch?v=_IugzPwpsyY\" target=\"_blank\">neuròleg Boris Cyrulnik</a> –referent en psicologia infantil– explica que la definició de resiliència no pot ser més simple: “És superar-se després d’un trauma”. Aquest expert explica que un infant necessita un entorn segur per ser resilient al llarg de la seva vida. “Els dos grans factors que fan vulnerable a l’infant són la violència entre els progenitors i la precarietat social”."
    			}
    		]
    	},
    	{
    		type: "video",
    		src: "04_resiliencia_2_10",
    		header: "Ester Cabanes,directora general d'Atenció a la Infància i l'Adolescència",
    		size: "small"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "La resiliència també és dels professionals que atenen a menors maltractats i abusats sexualment (en àmbit sanitari i assistencial). Fa anys que denunciant la saturació de casos i el <i>burn out</i> (o síndrome de desgast) que pateixen."
    			},
    			{
    				p: "“Un psicòleg privat pot atendre dos infants en un dia, i cobra 60 euros per sessió\", explica una psicòloga d'infantojuvenil que vol mantenir l'anonimat. \"Nosaltres tenim fins a vuit casos diaris i treballem en condicions salarials molt precàries. Més enllà de la mancança econòmica, és un greuge cap als infants. Per molta voluntat que hi posem, els menors que atens a darrera hora del dia surten pitjors parats per la càrrega emocional que ja portem a sobre\"."
    			}
    		]
    	},
    	{
    		type: "video",
    		src: "04_resiliencia_3_10",
    		header: "Carla Vall, advocada penalista i criminòloga",
    		size: "small"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Si a aquesta situació afegim <a href=\"https://www.lavanguardia.com/vida/20181003/452159942798/entitats-datencio-a-la-infancia-paguen-la-meitat-del-sou-als-seus-treballadors-per-endarreriments-de-la-dgaia.html\" target=\"_blank\">la inseguretat laboral</a>, tenim una bomba de rellotgeria: els professionals que s'han d'ocupar dels infants estan al bord del col·lapse. La DGAIA aporta els diners i, a través de licitacions, delega els serveis al sector privat. Entitats, fundacions i associacions subcontracten a professionals especialitzats, però aquests no estan equiparats ni en sous, ni en horaris, ni en vacances als treballadors públics. Del 2018 al 2020, <a href=\"https://cat.elpais.com/cat/2019/12/09/catalunya/1575915846_116214.html\" target=\"_blank\">es van manifestar </a>reiteradament pel retard en els pagaments per part de la DGAIA. El conflicte es va resoldre, però continuen precaritzats."
    			},
    			{
    				p: "Durant el confinament del 2020</a>, les violències als infants van quedar totalment invisibilitzades.  Sense escola, sense sortides, sense professionals als quals acudir. Les eines de recollida de dades van registrar fins a un 32% menys de casos, en comparació al 2019. <a href=\"https://www.sindic.cat/site/unitFiles/7419/Resum%20executiu%20catala%20Informe%20infancia_271120.pdf\" target=\"_blank\">A l'informe anual d'aquell any</a>, des del Síndic es va explicitar que \"no s'havien posat prou recursos per abordar l'emergència de la pandèmia, ni es va fer un seguiment acurat\"."
    			}
    		]
    	},
    	{
    		type: "video",
    		src: "04_resiliencia_4_10",
    		header: "Maria Jesús Larios, adjunta defensa drets infants i adolescents del Síndic de Greuges",
    		size: "small"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Resiliència és també la de l’Alba i la seva filla, que està obligada a anar a un punt de des de fa anys, tot i que <a href=\"https://d31243f8qkwz2j.cloudfront.net/public/docs/146/decret-357-2011-punt-trobada.pdf\" target=\"_blank\">el decret que regula aquests espais</a> explicita que la utilització \"ha de ser temporal i mai pot excedir els 18 mesos de durada\"."
    			},
    			{
    				p: "<a href=\"https://dretssocials.gencat.cat/web/.content/03ambits_tematics/15serveissocials/sistema_catala_serveis_socials/documents/informe_estat_serveis_socials/Informe-sobre-lestat-dels-serveis-socials-2020.pdf\" target=\"_blank\">Les dades públiques que hi ha sobre aquests serveis</a> són mínimes: el nombre de famílies i d'infants per any, però cap estudi sobre el nombre que hi assisteixen de manera cronificada. La Conselleria d'Igualtat i Feminismes té coneixement que en el 2020 – i només dels 18 serveis que controla- hi havia '58 menors que hi anaven des de feia més de dos anys'. Desconeix els motius pels quals aquests casos s’han cronificat en el temps. Dels 23 punts que hi ha a Catalunya, cinc són un conveni municipal (Sabadell, Terrassa, Granollers, Mollet i Sant Cugat) on la Generalitat assumeix part del cost; però, no fa el mateix seguiment"
    			}
    		]
    	},
    	{
    		type: "video",
    		src: "04_resiliencia_5_10",
    		header: "Alba",
    		size: "full"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Fins fa molt poc, la <a href=\"https://www.sjdhospitalbarcelona.org/ca/nens/abusos-al-menor-ufam\" target=\"_blank\">Unitat Funcional d’Abusos a Menors (UFAM)</a> de l'hospital Sant Joan de Déu ha estat –juntament amb l’Hospital Germans Trias– l’únic lloc de Catalunya on les mares podien acudir a fer una valoració mèdica dels seus infants des de la sanitat pública. Però en nombrosos casos, elles sortien culpabilitzades, amb dictàmens negatius dels abusos i amb l’amenaça de perdre la custòdia. Els informes de la UFAM eren una prova més que podien influenciar les valoracions judicials."
    			},
    			{
    				p: "El 2017 –davant l'allau de relats sobre irregularitats–, la diputada Gemma Lienas va presentar al Parlament de Catalunya una moció per demanar que la UFAM desaparegués i es creessin unitats de referència en diferents llocs. \"Els mètodes són molt qüestionables, els temps d'espera llarguíssims i no hi ha cap perspectiva de gènere\", va reclamar."
    			},
    			{
    				p: "<a href=\"https://www.parlament.cat/document/dspcc/123573582.pdf\" target=\"_blank\">El 2020, la Comissió d'Infància del Parlament </a>va instar la Generalitat a avançar en un canvi de model en la valoració d’abusos sexuals. I es va constatar que la justícia penal sovint fa prevaldre abans el dret del pare que el de l’infant."
    			},
    			{
    				p: "Actualment, les <a href=\"https://canalsalut.gencat.cat/web/.content/_A-Z/M/maltractaments_infancia/equips-funcionals-experts.pdf\" target=\"_blank\">unitats que valoren els abusos sexuals a infants a Catalunya són vuit</a>, i estan distribuïdes en funció de les regions sanitàries."
    			}
    		]
    	},
    	{
    		type: "video",
    		src: "04_resiliencia_6_10",
    		header: "Marta Simó, directora de la UFAM de l’Hospital St. Joan de Déu",
    		size: "small"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "L'any passat, el personal dels Serveis d'Intervenció Especialitzada (SIES) –que atenen les víctimes de violència masclista i els seus infants– també van fer arribar a la Conselleria d'Igualtat i Feminismes un llistat de reivindicacions, al qual aquest equip va tenir coneixement. Entre elles, la contradicció que se'ls exigeixi un alt grau d'especialització, assumint grans responsabilitats, però amb sous i condicions laborals molt precàries. Entre les demandes també hi constaven la reducció de les ràtios, més professionals a cada servei, que quan han d'acudir com a testimonis a judicis es preservin les seves dades personals davant de l'agressor i formació contínua especialitzada per abordar problemàtiques de gran complexitat."
    			}
    		]
    	},
    	{
    		type: "video",
    		src: "04_resiliencia_7_10",
    		header: "Laia Rosich, DG per a l'Erradicació de les Violències Masclistes",
    		size: "small"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "La magistrada Lucía Avilés expressa ben clar que \"la millora passa per una formació amb perspectiva de gènere i drets de la infància. I s'ha de notar des de l'inici, entre tots els que formem part de la cadena de justícia, quan les víctimes demanen ajut: des de l'àmbit de la salut, el policial, el social i, per descomptat, el judicial\"."
    			}
    		]
    	},
    	{
    		type: "video",
    		src: "04_resiliencia_8_10",
    		header: "Sergi Torras, sergent de la Unitat de Menors dels Mossos",
    		size: "small"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Les escoles són un dels primers llocs on es poden detectar les violències. Però si els docents no saben com identificar-les, o aplicar els protocols per posar en marxa els recursos públics disponibles, no podrà ajudar a l’infant. L’Informe <a href=\"https://www.savethechildren.es/sites/default/files/imce/docs/ulls_que_no_volen_veure-cat-web.pdf\" target=\"_blank\">“Ulls que no volen veure\" </a>de Save the Children denuncia “que falta formació específica i que és essencial que el professorat sàpiga com actuar per prevenir, detectar i gestionar els casos\"."
    			}
    		]
    	},
    	{
    		type: "video",
    		src: "04_resiliencia_9_10",
    		header: "Maria Jesús Larios, adjunta defensa drets infants i adolescents del Síndic de Greuges",
    		size: "small"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "L’any 2021, el Departament d’Educació va crear la Unitat de Suport a l’Alumnat en situació de Violència (USAV). En només un any, van atendre 843 casos en entorns escolars, la meitat d’ells eren per violències masclistes i maltractament infantil o adolescent. Es va crear la app mòbil UsApps, perquè les víctimes denunciessin directament els casos. Però després en un 92% dels casos són els familiars els que alerten."
    			}
    		]
    	},
    	{
    		type: "video",
    		src: "04_resiliencia_10_10",
    		header: "Rut Ribas, DG d'Alumnat al Dept.Educació",
    		size: "small"
    	},
    	{
    		type: "chapter",
    		id: "ara",
    		src: "por_chapter",
    		header: "I ara què?"
    	},
    	{
    		type: "video",
    		src: "05_i_ara_que_1_2_16",
    		header: "Lola i Alba",
    		size: "full"
    	},
    	{
    		type: "text",
    		text: [
    			{
    				p: "Els responsables dels serveis públics són conscients de les mancances actuals per protegir de les violències a infants i adolescents. Molts dels professionals que els atenen tenen una dedicació vocacional, però no és suficient. Calen més eines de prevenció i donar-les a conèixer a les víctimes en compliment dels seus drets. Des de tots els sectors assistencials es reclama, de manera urgent, formació en perspectiva de gènere."
    			}
    		]
    	},
    	{
    		type: "grid",
    		videos: [
    			{
    				src: "05_i_ara_que_mos_1_9",
    				header: "Carla Vall, advocada penalista i criminòloga"
    			},
    			{
    				src: "05_i_ara_que_mos_2_9",
    				header: "Rut Ribas, DG d'Alumnat al Dept.Educació"
    			},
    			{
    				src: "05_i_ara_que_mos_3_9",
    				header: "Ester Cabanes, directora general de la DGAIA"
    			},
    			{
    				src: "05_i_ara_que_mos_4_9",
    				header: "Marta Simó, directora de la UFAM de l’Hospital St. Joan de Déu"
    			},
    			{
    				src: "05_i_ara_que_mos_5_9",
    				header: "Sergi Torras, sergent de la Unitat de Menors dels Mossos"
    			},
    			{
    				src: "05_i_ara_que_mos_6_9",
    				header: "Laia Rosich, DG per a l'Eradicació de les Violències Masclistes"
    			},
    			{
    				src: "05_i_ara_que_mos_7_9",
    				header: "Maria Jesús Larios, Síndic de Greuges"
    			},
    			{
    				src: "05_i_ara_que_mos_8_9",
    				header: "Lucía Avilés, Jutgessa"
    			},
    			{
    				src: "05_i_ara_que_mos_9_9",
    				header: "Tània Verge, Consellera d'Igualtat i Feminismes"
    			}
    		]
    	},
    	{
    		type: "quote",
    		attribution: "<a href=\"https://www.parlament.cat/document/nom/TL115.pdf\"> Llei 14/2010, de 27 de maig, dels drets i les oportunitats en la infància i l’adolescència </a>",
    		quote: [
    			{
    				p: "“Article 7. Dret a ser escoltat\""
    			},
    			{
    				p: "1. Els infants i els adolescents, d’acord amb llurs capacitats evolutives i amb les competències assolides, i en qualsevol cas a partir dels dotze anys, han d’ésser escoltats tant en l’àmbit familiar, escolar i social com en els procediments administratius o judicials en què es trobin directament implicats i que aboquin a una decisió que n’afecti l’entorn personal, familiar, social o patrimonial."
    			},
    			{
    				p: "2. Els infants i els adolescents poden manifestar llur opinió ells mateixos, o mitjançant la persona que designin."
    			},
    			{
    				p: "3. En l’exercici del dret d’ésser escoltat s’han de respectar les condicions de discreció, intimitat, seguretat, recepció de suport, llibertat i adequació de la situació”."
    			}
    		]
    	},
    	{
    		type: "notes",
    		header: "I  jo… <br/> què puc fer?",
    		text: [
    			{
    				p: "Des de la societat, la comunitat de veïns, els companys d’escola o d’activitats de lleure, les amistats, la família, etc... tots som responsables de la protecció dels infants i adolescents. Així que tinguem la sospita d’un maltractament o d’un abús, podem actuar. Comunicar un indici és el primer pas perquè s’activin els serveis públics i professionals que tenim a l’abast."
    			},
    			{
    				p: "No t’ho pensis!"
    			}
    		],
    		list: [
    			"Truca al <a ref=\"https://dretssocials.gencat.cat/ca/ambits_tematics/infancia_i_adolescencia/proteccio_a_la_infancia_i_ladolescencia/maltractaments_dinfants_i_adolescents/infancia_respon/telefon_infancia_respon_116_111/\" target=\"_blank\">telèfon Infància respon 116 111</a>",
    			"Comunica els fets a través de <a href=\"https://usav.educacio.gencat.cat/\" target=\"_blank\">l’app d’educació Usapps</a>",
    			"Acut a l’<a ref=\"https://canalsalut.gencat.cat/web/.content/_A-Z/M/maltractaments_infancia/equips-funcionals-experts.pdf\" target=\"_blank\">equip de salut expert</a> per casos de violència sexual infantojuvenil i maltractament greu de la teva àrea",
    			"Servei Telefònic d’Atenció i Protecció per a víctimes de la violència de gènero (ATENPRO) 900 22 22 92"
    		]
    	},
    	{
    		type: "notes",
    		header: "",
    		text: [
    			{
    				p: "Aquest projecte va ser guardonat amb els <a href=\"https://www.barcelona.cat/premis-montserrat-roig/ca/\" target=_blank\">premis Montserrat Roig </a>, atorgat per l’Ajuntament de Barcelona (2019)"
    			},
    			{
    				p: "A més de les fonts que han donat el seu testimoni en aquest reportatge, volem agrair especialment el temps dedicat a les persones:"
    			}
    		],
    		list: [
    			"Lluïsa Garcia, doctora Unitat VM de l’Hospital Clínic",
    			"Olga Puig, psicòloga infantil de l’Hospital Clínic",
    			"Mònica Rubio, educadora a Institut Públic d’Alta Complexitat",
    			"Anna Choy, caporala dels Mossos d’Esquadra",
    			"Andrea Garcia, caporala dels Mossos d’Esquadra",
    			"Àngels Montoya, gerent al Consell de l’Advocacia Catalana",
    			"Cristina Baulies, Institut Català de les Dones",
    			"Gemma Roces, responsable de programes de dones, persones cuidadores, i maltractaments de la Creu Roja",
    			"Mercè Claramunt, advocada civil i de família",
    			"Vanessa Fraile, advocada de dret de Família i Violència de gènere i domèstica",
    			"Als professionals d’altres serveis assistencials: cases d’acollida, Serveis d’Intervenció Especialitzada (SIEs), EAIAs, centres de menors i serveis socials que van donar-nos context, de manera anònima.",
    			"Volem agrair la confiança a les dones víctimes de violència masclista entrevistades anònimament per explicar-nos la situació de les seves filles i fills.",
    			"I un especial agraïment a les dues joves que, després d’explicar-nos el seu relat d’abús i maltractament, no van voler sortir esmentades."
    		]
    	}
    ];
    var meta$1 = {
    	title: "",
    	url: "",
    	description: "",
    	keywords: ""
    };
    var story = {
    	article: article,
    	meta: meta$1
    };

    const content = story.article;
    const meta = story.meta;

    const app = new App({
      target: document.body,
      props: {
        content: content,
        meta: meta
      }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
