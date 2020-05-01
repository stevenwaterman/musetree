
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
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
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
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
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
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
        const z_index = (parseInt(computed_style.zIndex) || 0) - 1;
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', `display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ` +
            `overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: ${z_index};`);
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        let unsubscribe;
        if (is_crossorigin()) {
            iframe.src = `data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>`;
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
            detach(iframe);
            if (unsubscribe)
                unsubscribe();
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
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
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
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
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
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
    function add_render_callback(fn) {
        render_callbacks.push(fn);
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
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
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
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
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
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next, lookup.has(block.key));
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
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
        const prop_values = options.props || {};
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
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
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
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
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
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.21.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
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
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
      try {
        var info = gen[key](arg);
        var value = info.value;
      } catch (error) {
        reject(error);
        return;
      }

      if (info.done) {
        resolve(value);
      } else {
        Promise.resolve(value).then(_next, _throw);
      }
    }

    function _asyncToGenerator(fn) {
      return function () {
        var self = this,
            args = arguments;
        return new Promise(function (resolve, reject) {
          var gen = fn.apply(self, args);

          function _next(value) {
            asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
          }

          function _throw(err) {
            asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
          }

          _next(undefined);
        });
      };
    }

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      return Constructor;
    }

    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }

      return obj;
    }

    function ownKeys(object, enumerableOnly) {
      var keys = Object.keys(object);

      if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) symbols = symbols.filter(function (sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        });
        keys.push.apply(keys, symbols);
      }

      return keys;
    }

    function _objectSpread2(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i] != null ? arguments[i] : {};

        if (i % 2) {
          ownKeys(Object(source), true).forEach(function (key) {
            _defineProperty(target, key, source[key]);
          });
        } else if (Object.getOwnPropertyDescriptors) {
          Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
        } else {
          ownKeys(Object(source)).forEach(function (key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
          });
        }
      }

      return target;
    }

    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function");
      }

      subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
          value: subClass,
          writable: true,
          configurable: true
        }
      });
      if (superClass) _setPrototypeOf(subClass, superClass);
    }

    function _getPrototypeOf(o) {
      _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
        return o.__proto__ || Object.getPrototypeOf(o);
      };
      return _getPrototypeOf(o);
    }

    function _setPrototypeOf(o, p) {
      _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
        o.__proto__ = p;
        return o;
      };

      return _setPrototypeOf(o, p);
    }

    function _isNativeReflectConstruct() {
      if (typeof Reflect === "undefined" || !Reflect.construct) return false;
      if (Reflect.construct.sham) return false;
      if (typeof Proxy === "function") return true;

      try {
        Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
        return true;
      } catch (e) {
        return false;
      }
    }

    function _assertThisInitialized(self) {
      if (self === void 0) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }

      return self;
    }

    function _possibleConstructorReturn(self, call) {
      if (call && (typeof call === "object" || typeof call === "function")) {
        return call;
      }

      return _assertThisInitialized(self);
    }

    function _createSuper(Derived) {
      var hasNativeReflectConstruct = _isNativeReflectConstruct();

      return function () {
        var Super = _getPrototypeOf(Derived),
            result;

        if (hasNativeReflectConstruct) {
          var NewTarget = _getPrototypeOf(this).constructor;

          result = Reflect.construct(Super, arguments, NewTarget);
        } else {
          result = Super.apply(this, arguments);
        }

        return _possibleConstructorReturn(this, result);
      };
    }

    function _slicedToArray(arr, i) {
      return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
    }

    function _toConsumableArray(arr) {
      return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
    }

    function _arrayWithoutHoles(arr) {
      if (Array.isArray(arr)) return _arrayLikeToArray(arr);
    }

    function _arrayWithHoles(arr) {
      if (Array.isArray(arr)) return arr;
    }

    function _iterableToArray(iter) {
      if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
    }

    function _iterableToArrayLimit(arr, i) {
      if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"] != null) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }

    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;

      for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

      return arr2;
    }

    function _nonIterableSpread() {
      throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    function _nonIterableRest() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var check = function (it) {
      return it && it.Math == Math && it;
    };

    // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
    var global_1 =
      // eslint-disable-next-line no-undef
      check(typeof globalThis == 'object' && globalThis) ||
      check(typeof window == 'object' && window) ||
      check(typeof self == 'object' && self) ||
      check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
      // eslint-disable-next-line no-new-func
      Function('return this')();

    var fails = function (exec) {
      try {
        return !!exec();
      } catch (error) {
        return true;
      }
    };

    // Thank's IE8 for his funny defineProperty
    var descriptors = !fails(function () {
      return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
    });

    var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

    // Nashorn ~ JDK8 bug
    var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);

    // `Object.prototype.propertyIsEnumerable` method implementation
    // https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable
    var f = NASHORN_BUG ? function propertyIsEnumerable(V) {
      var descriptor = getOwnPropertyDescriptor(this, V);
      return !!descriptor && descriptor.enumerable;
    } : nativePropertyIsEnumerable;

    var objectPropertyIsEnumerable = {
    	f: f
    };

    var createPropertyDescriptor = function (bitmap, value) {
      return {
        enumerable: !(bitmap & 1),
        configurable: !(bitmap & 2),
        writable: !(bitmap & 4),
        value: value
      };
    };

    var toString = {}.toString;

    var classofRaw = function (it) {
      return toString.call(it).slice(8, -1);
    };

    var split = ''.split;

    // fallback for non-array-like ES3 and non-enumerable old V8 strings
    var indexedObject = fails(function () {
      // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
      // eslint-disable-next-line no-prototype-builtins
      return !Object('z').propertyIsEnumerable(0);
    }) ? function (it) {
      return classofRaw(it) == 'String' ? split.call(it, '') : Object(it);
    } : Object;

    // `RequireObjectCoercible` abstract operation
    // https://tc39.github.io/ecma262/#sec-requireobjectcoercible
    var requireObjectCoercible = function (it) {
      if (it == undefined) throw TypeError("Can't call method on " + it);
      return it;
    };

    // toObject with fallback for non-array-like ES3 strings



    var toIndexedObject = function (it) {
      return indexedObject(requireObjectCoercible(it));
    };

    var isObject = function (it) {
      return typeof it === 'object' ? it !== null : typeof it === 'function';
    };

    // `ToPrimitive` abstract operation
    // https://tc39.github.io/ecma262/#sec-toprimitive
    // instead of the ES6 spec version, we didn't implement @@toPrimitive case
    // and the second argument - flag - preferred type is a string
    var toPrimitive = function (input, PREFERRED_STRING) {
      if (!isObject(input)) return input;
      var fn, val;
      if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
      if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
      if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
      throw TypeError("Can't convert object to primitive value");
    };

    var hasOwnProperty = {}.hasOwnProperty;

    var has = function (it, key) {
      return hasOwnProperty.call(it, key);
    };

    var document$1 = global_1.document;
    // typeof document.createElement is 'object' in old IE
    var EXISTS = isObject(document$1) && isObject(document$1.createElement);

    var documentCreateElement = function (it) {
      return EXISTS ? document$1.createElement(it) : {};
    };

    // Thank's IE8 for his funny defineProperty
    var ie8DomDefine = !descriptors && !fails(function () {
      return Object.defineProperty(documentCreateElement('div'), 'a', {
        get: function () { return 7; }
      }).a != 7;
    });

    var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

    // `Object.getOwnPropertyDescriptor` method
    // https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor
    var f$1 = descriptors ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
      O = toIndexedObject(O);
      P = toPrimitive(P, true);
      if (ie8DomDefine) try {
        return nativeGetOwnPropertyDescriptor(O, P);
      } catch (error) { /* empty */ }
      if (has(O, P)) return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]);
    };

    var objectGetOwnPropertyDescriptor = {
    	f: f$1
    };

    var anObject = function (it) {
      if (!isObject(it)) {
        throw TypeError(String(it) + ' is not an object');
      } return it;
    };

    var nativeDefineProperty = Object.defineProperty;

    // `Object.defineProperty` method
    // https://tc39.github.io/ecma262/#sec-object.defineproperty
    var f$2 = descriptors ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
      anObject(O);
      P = toPrimitive(P, true);
      anObject(Attributes);
      if (ie8DomDefine) try {
        return nativeDefineProperty(O, P, Attributes);
      } catch (error) { /* empty */ }
      if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
      if ('value' in Attributes) O[P] = Attributes.value;
      return O;
    };

    var objectDefineProperty = {
    	f: f$2
    };

    var createNonEnumerableProperty = descriptors ? function (object, key, value) {
      return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
    } : function (object, key, value) {
      object[key] = value;
      return object;
    };

    var setGlobal = function (key, value) {
      try {
        createNonEnumerableProperty(global_1, key, value);
      } catch (error) {
        global_1[key] = value;
      } return value;
    };

    var SHARED = '__core-js_shared__';
    var store = global_1[SHARED] || setGlobal(SHARED, {});

    var sharedStore = store;

    var functionToString = Function.toString;

    // this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper
    if (typeof sharedStore.inspectSource != 'function') {
      sharedStore.inspectSource = function (it) {
        return functionToString.call(it);
      };
    }

    var inspectSource = sharedStore.inspectSource;

    var WeakMap = global_1.WeakMap;

    var nativeWeakMap = typeof WeakMap === 'function' && /native code/.test(inspectSource(WeakMap));

    var shared = createCommonjsModule(function (module) {
    (module.exports = function (key, value) {
      return sharedStore[key] || (sharedStore[key] = value !== undefined ? value : {});
    })('versions', []).push({
      version: '3.6.5',
      mode:  'global',
      copyright: '© 2020 Denis Pushkarev (zloirock.ru)'
    });
    });

    var id = 0;
    var postfix = Math.random();

    var uid = function (key) {
      return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
    };

    var keys = shared('keys');

    var sharedKey = function (key) {
      return keys[key] || (keys[key] = uid(key));
    };

    var hiddenKeys = {};

    var WeakMap$1 = global_1.WeakMap;
    var set, get, has$1;

    var enforce = function (it) {
      return has$1(it) ? get(it) : set(it, {});
    };

    var getterFor = function (TYPE) {
      return function (it) {
        var state;
        if (!isObject(it) || (state = get(it)).type !== TYPE) {
          throw TypeError('Incompatible receiver, ' + TYPE + ' required');
        } return state;
      };
    };

    if (nativeWeakMap) {
      var store$1 = new WeakMap$1();
      var wmget = store$1.get;
      var wmhas = store$1.has;
      var wmset = store$1.set;
      set = function (it, metadata) {
        wmset.call(store$1, it, metadata);
        return metadata;
      };
      get = function (it) {
        return wmget.call(store$1, it) || {};
      };
      has$1 = function (it) {
        return wmhas.call(store$1, it);
      };
    } else {
      var STATE = sharedKey('state');
      hiddenKeys[STATE] = true;
      set = function (it, metadata) {
        createNonEnumerableProperty(it, STATE, metadata);
        return metadata;
      };
      get = function (it) {
        return has(it, STATE) ? it[STATE] : {};
      };
      has$1 = function (it) {
        return has(it, STATE);
      };
    }

    var internalState = {
      set: set,
      get: get,
      has: has$1,
      enforce: enforce,
      getterFor: getterFor
    };

    var redefine = createCommonjsModule(function (module) {
    var getInternalState = internalState.get;
    var enforceInternalState = internalState.enforce;
    var TEMPLATE = String(String).split('String');

    (module.exports = function (O, key, value, options) {
      var unsafe = options ? !!options.unsafe : false;
      var simple = options ? !!options.enumerable : false;
      var noTargetGet = options ? !!options.noTargetGet : false;
      if (typeof value == 'function') {
        if (typeof key == 'string' && !has(value, 'name')) createNonEnumerableProperty(value, 'name', key);
        enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
      }
      if (O === global_1) {
        if (simple) O[key] = value;
        else setGlobal(key, value);
        return;
      } else if (!unsafe) {
        delete O[key];
      } else if (!noTargetGet && O[key]) {
        simple = true;
      }
      if (simple) O[key] = value;
      else createNonEnumerableProperty(O, key, value);
    // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
    })(Function.prototype, 'toString', function toString() {
      return typeof this == 'function' && getInternalState(this).source || inspectSource(this);
    });
    });

    var path = global_1;

    var aFunction = function (variable) {
      return typeof variable == 'function' ? variable : undefined;
    };

    var getBuiltIn = function (namespace, method) {
      return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global_1[namespace])
        : path[namespace] && path[namespace][method] || global_1[namespace] && global_1[namespace][method];
    };

    var ceil = Math.ceil;
    var floor = Math.floor;

    // `ToInteger` abstract operation
    // https://tc39.github.io/ecma262/#sec-tointeger
    var toInteger = function (argument) {
      return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
    };

    var min = Math.min;

    // `ToLength` abstract operation
    // https://tc39.github.io/ecma262/#sec-tolength
    var toLength = function (argument) {
      return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
    };

    var max = Math.max;
    var min$1 = Math.min;

    // Helper for a popular repeating case of the spec:
    // Let integer be ? ToInteger(index).
    // If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
    var toAbsoluteIndex = function (index, length) {
      var integer = toInteger(index);
      return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
    };

    // `Array.prototype.{ indexOf, includes }` methods implementation
    var createMethod = function (IS_INCLUDES) {
      return function ($this, el, fromIndex) {
        var O = toIndexedObject($this);
        var length = toLength(O.length);
        var index = toAbsoluteIndex(fromIndex, length);
        var value;
        // Array#includes uses SameValueZero equality algorithm
        // eslint-disable-next-line no-self-compare
        if (IS_INCLUDES && el != el) while (length > index) {
          value = O[index++];
          // eslint-disable-next-line no-self-compare
          if (value != value) return true;
        // Array#indexOf ignores holes, Array#includes - not
        } else for (;length > index; index++) {
          if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
        } return !IS_INCLUDES && -1;
      };
    };

    var arrayIncludes = {
      // `Array.prototype.includes` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.includes
      includes: createMethod(true),
      // `Array.prototype.indexOf` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
      indexOf: createMethod(false)
    };

    var indexOf = arrayIncludes.indexOf;


    var objectKeysInternal = function (object, names) {
      var O = toIndexedObject(object);
      var i = 0;
      var result = [];
      var key;
      for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key);
      // Don't enum bug & hidden keys
      while (names.length > i) if (has(O, key = names[i++])) {
        ~indexOf(result, key) || result.push(key);
      }
      return result;
    };

    // IE8- don't enum bug keys
    var enumBugKeys = [
      'constructor',
      'hasOwnProperty',
      'isPrototypeOf',
      'propertyIsEnumerable',
      'toLocaleString',
      'toString',
      'valueOf'
    ];

    var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype');

    // `Object.getOwnPropertyNames` method
    // https://tc39.github.io/ecma262/#sec-object.getownpropertynames
    var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
      return objectKeysInternal(O, hiddenKeys$1);
    };

    var objectGetOwnPropertyNames = {
    	f: f$3
    };

    var f$4 = Object.getOwnPropertySymbols;

    var objectGetOwnPropertySymbols = {
    	f: f$4
    };

    // all object keys, includes non-enumerable and symbols
    var ownKeys$1 = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
      var keys = objectGetOwnPropertyNames.f(anObject(it));
      var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
      return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
    };

    var copyConstructorProperties = function (target, source) {
      var keys = ownKeys$1(source);
      var defineProperty = objectDefineProperty.f;
      var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
      }
    };

    var replacement = /#|\.prototype\./;

    var isForced = function (feature, detection) {
      var value = data[normalize(feature)];
      return value == POLYFILL ? true
        : value == NATIVE ? false
        : typeof detection == 'function' ? fails(detection)
        : !!detection;
    };

    var normalize = isForced.normalize = function (string) {
      return String(string).replace(replacement, '.').toLowerCase();
    };

    var data = isForced.data = {};
    var NATIVE = isForced.NATIVE = 'N';
    var POLYFILL = isForced.POLYFILL = 'P';

    var isForced_1 = isForced;

    var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;






    /*
      options.target      - name of the target object
      options.global      - target is the global object
      options.stat        - export as static methods of target
      options.proto       - export as prototype methods of target
      options.real        - real prototype method for the `pure` version
      options.forced      - export even if the native feature is available
      options.bind        - bind methods to the target, required for the `pure` version
      options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
      options.unsafe      - use the simple assignment of property instead of delete + defineProperty
      options.sham        - add a flag to not completely full polyfills
      options.enumerable  - export as enumerable property
      options.noTargetGet - prevent calling a getter on target
    */
    var _export = function (options, source) {
      var TARGET = options.target;
      var GLOBAL = options.global;
      var STATIC = options.stat;
      var FORCED, target, key, targetProperty, sourceProperty, descriptor;
      if (GLOBAL) {
        target = global_1;
      } else if (STATIC) {
        target = global_1[TARGET] || setGlobal(TARGET, {});
      } else {
        target = (global_1[TARGET] || {}).prototype;
      }
      if (target) for (key in source) {
        sourceProperty = source[key];
        if (options.noTargetGet) {
          descriptor = getOwnPropertyDescriptor$1(target, key);
          targetProperty = descriptor && descriptor.value;
        } else targetProperty = target[key];
        FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
        // contained in target
        if (!FORCED && targetProperty !== undefined) {
          if (typeof sourceProperty === typeof targetProperty) continue;
          copyConstructorProperties(sourceProperty, targetProperty);
        }
        // add a flag to not completely full polyfills
        if (options.sham || (targetProperty && targetProperty.sham)) {
          createNonEnumerableProperty(sourceProperty, 'sham', true);
        }
        // extend global
        redefine(target, key, sourceProperty, options);
      }
    };

    // `IsArray` abstract operation
    // https://tc39.github.io/ecma262/#sec-isarray
    var isArray = Array.isArray || function isArray(arg) {
      return classofRaw(arg) == 'Array';
    };

    // `ToObject` abstract operation
    // https://tc39.github.io/ecma262/#sec-toobject
    var toObject = function (argument) {
      return Object(requireObjectCoercible(argument));
    };

    var createProperty = function (object, key, value) {
      var propertyKey = toPrimitive(key);
      if (propertyKey in object) objectDefineProperty.f(object, propertyKey, createPropertyDescriptor(0, value));
      else object[propertyKey] = value;
    };

    var nativeSymbol = !!Object.getOwnPropertySymbols && !fails(function () {
      // Chrome 38 Symbol has incorrect toString conversion
      // eslint-disable-next-line no-undef
      return !String(Symbol());
    });

    var useSymbolAsUid = nativeSymbol
      // eslint-disable-next-line no-undef
      && !Symbol.sham
      // eslint-disable-next-line no-undef
      && typeof Symbol.iterator == 'symbol';

    var WellKnownSymbolsStore = shared('wks');
    var Symbol$1 = global_1.Symbol;
    var createWellKnownSymbol = useSymbolAsUid ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid;

    var wellKnownSymbol = function (name) {
      if (!has(WellKnownSymbolsStore, name)) {
        if (nativeSymbol && has(Symbol$1, name)) WellKnownSymbolsStore[name] = Symbol$1[name];
        else WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name);
      } return WellKnownSymbolsStore[name];
    };

    var SPECIES = wellKnownSymbol('species');

    // `ArraySpeciesCreate` abstract operation
    // https://tc39.github.io/ecma262/#sec-arrayspeciescreate
    var arraySpeciesCreate = function (originalArray, length) {
      var C;
      if (isArray(originalArray)) {
        C = originalArray.constructor;
        // cross-realm fallback
        if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
        else if (isObject(C)) {
          C = C[SPECIES];
          if (C === null) C = undefined;
        }
      } return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
    };

    var engineUserAgent = getBuiltIn('navigator', 'userAgent') || '';

    var process = global_1.process;
    var versions = process && process.versions;
    var v8 = versions && versions.v8;
    var match, version;

    if (v8) {
      match = v8.split('.');
      version = match[0] + match[1];
    } else if (engineUserAgent) {
      match = engineUserAgent.match(/Edge\/(\d+)/);
      if (!match || match[1] >= 74) {
        match = engineUserAgent.match(/Chrome\/(\d+)/);
        if (match) version = match[1];
      }
    }

    var engineV8Version = version && +version;

    var SPECIES$1 = wellKnownSymbol('species');

    var arrayMethodHasSpeciesSupport = function (METHOD_NAME) {
      // We can't use this feature detection in V8 since it causes
      // deoptimization and serious performance degradation
      // https://github.com/zloirock/core-js/issues/677
      return engineV8Version >= 51 || !fails(function () {
        var array = [];
        var constructor = array.constructor = {};
        constructor[SPECIES$1] = function () {
          return { foo: 1 };
        };
        return array[METHOD_NAME](Boolean).foo !== 1;
      });
    };

    var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');
    var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
    var MAXIMUM_ALLOWED_INDEX_EXCEEDED = 'Maximum allowed index exceeded';

    // We can't use this feature detection in V8 since it causes
    // deoptimization and serious performance degradation
    // https://github.com/zloirock/core-js/issues/679
    var IS_CONCAT_SPREADABLE_SUPPORT = engineV8Version >= 51 || !fails(function () {
      var array = [];
      array[IS_CONCAT_SPREADABLE] = false;
      return array.concat()[0] !== array;
    });

    var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('concat');

    var isConcatSpreadable = function (O) {
      if (!isObject(O)) return false;
      var spreadable = O[IS_CONCAT_SPREADABLE];
      return spreadable !== undefined ? !!spreadable : isArray(O);
    };

    var FORCED = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT;

    // `Array.prototype.concat` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.concat
    // with adding support of @@isConcatSpreadable and @@species
    _export({ target: 'Array', proto: true, forced: FORCED }, {
      concat: function concat(arg) { // eslint-disable-line no-unused-vars
        var O = toObject(this);
        var A = arraySpeciesCreate(O, 0);
        var n = 0;
        var i, k, length, len, E;
        for (i = -1, length = arguments.length; i < length; i++) {
          E = i === -1 ? O : arguments[i];
          if (isConcatSpreadable(E)) {
            len = toLength(E.length);
            if (n + len > MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
            for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
          } else {
            if (n >= MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
            createProperty(A, n++, E);
          }
        }
        A.length = n;
        return A;
      }
    });

    function createRootEncodingStore() {
      return writable({
        encoding: []
      });
    }
    function createBranchEncodingStore(parent, sectionStore) {
      return derived([parent, sectionStore], function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            $parent = _ref2[0],
            $sectionStore = _ref2[1];

        return {
          encoding: [].concat(_toConsumableArray($parent.encoding), _toConsumableArray($sectionStore.section.encoding))
        };
      });
    }
    function createEncodingStore(parent, sectionStore) {
      if (parent === null) {
        return createRootEncodingStore();
      } else if (parent.type === "root") {
        return createBranchEncodingStore(createRootEncodingStore(), sectionStore);
      } else {
        return createBranchEncodingStore(parent, sectionStore);
      }
    }

    var defineProperty = Object.defineProperty;
    var cache = {};

    var thrower = function (it) { throw it; };

    var arrayMethodUsesToLength = function (METHOD_NAME, options) {
      if (has(cache, METHOD_NAME)) return cache[METHOD_NAME];
      if (!options) options = {};
      var method = [][METHOD_NAME];
      var ACCESSORS = has(options, 'ACCESSORS') ? options.ACCESSORS : false;
      var argument0 = has(options, 0) ? options[0] : thrower;
      var argument1 = has(options, 1) ? options[1] : undefined;

      return cache[METHOD_NAME] = !!method && !fails(function () {
        if (ACCESSORS && !descriptors) return true;
        var O = { length: -1 };

        if (ACCESSORS) defineProperty(O, 1, { enumerable: true, get: thrower });
        else O[1] = 1;

        method.call(O, argument0, argument1);
      });
    };

    var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('slice');
    var USES_TO_LENGTH = arrayMethodUsesToLength('slice', { ACCESSORS: true, 0: 0, 1: 2 });

    var SPECIES$2 = wellKnownSymbol('species');
    var nativeSlice = [].slice;
    var max$1 = Math.max;

    // `Array.prototype.slice` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.slice
    // fallback for not array-like ES3 strings and DOM objects
    _export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH }, {
      slice: function slice(start, end) {
        var O = toIndexedObject(this);
        var length = toLength(O.length);
        var k = toAbsoluteIndex(start, length);
        var fin = toAbsoluteIndex(end === undefined ? length : end, length);
        // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
        var Constructor, result, n;
        if (isArray(O)) {
          Constructor = O.constructor;
          // cross-realm fallback
          if (typeof Constructor == 'function' && (Constructor === Array || isArray(Constructor.prototype))) {
            Constructor = undefined;
          } else if (isObject(Constructor)) {
            Constructor = Constructor[SPECIES$2];
            if (Constructor === null) Constructor = undefined;
          }
          if (Constructor === Array || Constructor === undefined) {
            return nativeSlice.call(O, k, fin);
          }
        }
        result = new (Constructor === undefined ? Array : Constructor)(max$1(fin - k, 0));
        for (n = 0; k < fin; k++, n++) if (k in O) createProperty(result, n, O[k]);
        result.length = n;
        return result;
      }
    });

    function unwrapStore(store_2) {
      var equality = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (a, b) {
        return a === b;
      };
      var value = null;
      var output = writable(null);

      var unsubscribe = function unsubscribe() {};

      store_2.subscribe(function (store) {
        unsubscribe();

        if (store !== null) {
          unsubscribe = store.subscribe(function (state) {
            if (value === null && state !== null || value !== null && state === null || value !== null && state !== null && !equality(value, state)) {
              console.log("Updating to ", state);
              value = state;
              output.set(state);
            }
          });
        } else {
          unsubscribe = function unsubscribe() {};
        }
      });
      return output;
    }

    /*
       _____ _______    _______ ______   _________     _______  ______  _____
      / ____|__   __|/\|__   __|  ____| |__   __\ \   / /  __ \|  ____|/ ____|
     | (___    | |  /  \  | |  | |__       | |   \ \_/ /| |__) | |__  | (___
      \___ \   | | / /\ \ | |  |  __|      | |    \   / |  ___/|  __|  \___ \
      ____) |  | |/ ____ \| |  | |____     | |     | |  | |    | |____ ____) |
     |_____/   |_/_/    \_\_|  |______|    |_|     |_|  |_|    |______|_____/
    */

    function rootSelect(unsafeMutableStore, selectedStore, path) {
      if (path.length === 0) {
        unsafeMutableStore.update(function (state) {
          selectedStore.set(null);
          return _objectSpread2(_objectSpread2({}, state), {}, {
            selectedChild: null,
            lastSelected: state.selectedChild
          });
        });
        return;
      }

      unsafeMutableStore.update(function (state) {
        var newSelectedChild = state.children[path[0]];

        if (newSelectedChild === undefined) {
          selectedStore.set(null);
          return _objectSpread2(_objectSpread2({}, state), {}, {
            selectedChild: null,
            lastSelected: state.selectedChild
          });
        }

        var pathForChild = _toConsumableArray(path);

        pathForChild.shift();
        newSelectedChild.internalSelect(pathForChild);
        return _objectSpread2(_objectSpread2({}, state), {}, {
          selectedChild: path[0],
          lastSelected: state.selectedChild
        });
      });
    }

    function branchSelect(unsafeMutableStore, select, path) {
      if (path.length === 0) {
        unsafeMutableStore.update(function (state) {
          select();
          return _objectSpread2(_objectSpread2({}, state), {}, {
            selectedChild: null,
            lastSelected: state.selectedChild
          });
        });
        return;
      }

      unsafeMutableStore.update(function (state) {
        var newSelectedChild = state.children[path[0]];

        if (newSelectedChild === undefined) {
          select();
          return _objectSpread2(_objectSpread2({}, state), {}, {
            selectedChild: null,
            lastSelected: state.selectedChild
          });
        }

        var pathForChild = _toConsumableArray(path);

        pathForChild.shift();
        newSelectedChild.internalSelect(pathForChild);
        return _objectSpread2(_objectSpread2({}, state), {}, {
          selectedChild: path[0],
          lastSelected: state.selectedChild
        });
      });
    }

    function _addChild(internalStore, decoratedStore, selectedStore, stateDecorationStore, storeDecorationSupplier) {
      internalStore.update(function (state) {
        var childIndex = state.nextChildIndex;
        var selectionInfoStore = derived(decoratedStore, function ($parentTotal) {
          return {
            selectedByParent: $parentTotal.selectedChild === childIndex,
            wasLastSelectedByParent: $parentTotal.lastSelected === childIndex,
            onSelectedPath: $parentTotal.onSelectedPath && $parentTotal.selectedChild === childIndex
          };
        });
        var newChild = createBranchStore([].concat(_toConsumableArray(state.path), [childIndex]), stateDecorationStore, storeDecorationSupplier, selectionInfoStore, selectedStore);

        var children = _objectSpread2({}, state.children);

        children[state.nextChildIndex] = newChild;
        return _objectSpread2(_objectSpread2({}, state), {}, {
          children: children,
          nextChildIndex: childIndex + 1
        });
      });
    }

    function rootDeleteChild(internalStore, selectedStore, childIdx) {
      internalStore.update(function (state) {
        var removedChild = state.children[childIdx];
        if (removedChild === undefined) return state;

        var newChildren = _objectSpread2({}, state.children);

        delete newChildren[childIdx];

        var newState = _objectSpread2(_objectSpread2({}, state), {}, {
          children: newChildren
        });

        if (state.selectedChild === childIdx) {
          newState.selectedChild = null;
          selectedStore.set(null);
        }

        if (state.lastSelected === childIdx) {
          newState.lastSelected = null;
        }

        return newState;
      });
    }

    function branchDeleteChild(internalStore, select, childIdx) {
      internalStore.update(function (state) {
        var removedChild = state.children[childIdx];
        if (removedChild === undefined) return state;

        var newChildren = _objectSpread2({}, state.children);

        delete newChildren[childIdx];

        var newState = _objectSpread2(_objectSpread2({}, state), {}, {
          children: newChildren
        });

        if (state.selectedChild === childIdx) {
          newState.selectedChild = null;
          select();
        }

        if (state.lastSelected === childIdx) {
          newState.lastSelected = null;
        }

        return newState;
      });
    }

    function createRootStore(stateDecorationStore, storeDecorationSupplier_Root) {
      var initialState = {
        type: "root",
        children: {},
        nextChildIndex: 1,
        selectedChild: null,
        lastSelected: null,
        path: []
      };
      var internalStore = writable(initialState);
      var selectionInfoStore = writable({
        selectedByParent: true,
        wasLastSelectedByParent: false,
        onSelectedPath: true
      });
      var decoratedStateStore = derived([internalStore, stateDecorationStore, selectionInfoStore], function (_ref) {
        var _ref2 = _slicedToArray(_ref, 3),
            $internalStore = _ref2[0],
            $decorationStore = _ref2[1],
            $selectionInfoStore = _ref2[2];

        return _objectSpread2(_objectSpread2(_objectSpread2({}, $internalStore), $decorationStore), $selectionInfoStore);
      });
      var mutableSelectedStore = writable(null);
      var partDecorated;
      partDecorated = _objectSpread2(_objectSpread2({
        type: "root"
      }, decoratedStateStore), {}, {
        addChild: function addChild(stateDecorationStore, storeDecorationSupplier) {
          return _addChild(internalStore, decoratedStateStore, mutableSelectedStore, stateDecorationStore, storeDecorationSupplier);
        },
        select: function select(path) {
          return rootSelect(internalStore, mutableSelectedStore, path);
        },
        deleteChild: function deleteChild(childIdx) {
          return rootDeleteChild(internalStore, mutableSelectedStore, childIdx);
        },
        selectedStore_2: mutableSelectedStore,
        selectedChildStore_2: deriveSelectedChildStore(decoratedStateStore)
      });
      return _objectSpread2(_objectSpread2({}, partDecorated), storeDecorationSupplier_Root(partDecorated));
    }

    function createBranchStore(path, decorationStore, storeDecorationSupplier, selectionInfoStore, selectedStore) {
      var initialState = {
        type: "branch",
        nextChildIndex: 1,
        children: {},
        selectedChild: null,
        lastSelected: null,
        path: path
      };
      var internalStore = writable(initialState);
      var decoratedStore = derived([internalStore, decorationStore, selectionInfoStore], function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 3),
            $internalStore = _ref4[0],
            $decorationStore = _ref4[1],
            $selectionInfoStore = _ref4[2];

        return _objectSpread2(_objectSpread2(_objectSpread2({}, $internalStore), $decorationStore), $selectionInfoStore);
      });
      var partDecorated;
      var fullyDecorated;

      var select = function select() {
        selectedStore.set(fullyDecorated);
      };

      partDecorated = _objectSpread2(_objectSpread2({
        type: "branch"
      }, decoratedStore), {}, {
        selectedChildStore_2: deriveSelectedChildStore(decoratedStore),
        internalSelect: function internalSelect(path) {
          return branchSelect(internalStore, select, path);
        },
        addChild: function addChild(stateDecorationStore, storeDecorationSupplier) {
          return _addChild(internalStore, decoratedStore, selectedStore, stateDecorationStore, storeDecorationSupplier);
        },
        deleteChild: function deleteChild(childIdx) {
          return branchDeleteChild(internalStore, select, childIdx);
        }
      });
      fullyDecorated = _objectSpread2(_objectSpread2({}, partDecorated), storeDecorationSupplier(partDecorated));
      return fullyDecorated;
    }

    function deriveSelectedChildStore(parentStore) {
      return derived(parentStore, function ($parentStore) {
        var idx = $parentStore.selectedChild;
        if (idx === null) return null;
        var selected = $parentStore.children[idx];
        return selected === undefined ? null : selected;
      });
    }

    var createTree = createRootStore;

    var aFunction$1 = function (it) {
      if (typeof it != 'function') {
        throw TypeError(String(it) + ' is not a function');
      } return it;
    };

    // optional / simple context binding
    var functionBindContext = function (fn, that, length) {
      aFunction$1(fn);
      if (that === undefined) return fn;
      switch (length) {
        case 0: return function () {
          return fn.call(that);
        };
        case 1: return function (a) {
          return fn.call(that, a);
        };
        case 2: return function (a, b) {
          return fn.call(that, a, b);
        };
        case 3: return function (a, b, c) {
          return fn.call(that, a, b, c);
        };
      }
      return function (/* ...args */) {
        return fn.apply(that, arguments);
      };
    };

    var push = [].push;

    // `Array.prototype.{ forEach, map, filter, some, every, find, findIndex }` methods implementation
    var createMethod$1 = function (TYPE) {
      var IS_MAP = TYPE == 1;
      var IS_FILTER = TYPE == 2;
      var IS_SOME = TYPE == 3;
      var IS_EVERY = TYPE == 4;
      var IS_FIND_INDEX = TYPE == 6;
      var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
      return function ($this, callbackfn, that, specificCreate) {
        var O = toObject($this);
        var self = indexedObject(O);
        var boundFunction = functionBindContext(callbackfn, that, 3);
        var length = toLength(self.length);
        var index = 0;
        var create = specificCreate || arraySpeciesCreate;
        var target = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
        var value, result;
        for (;length > index; index++) if (NO_HOLES || index in self) {
          value = self[index];
          result = boundFunction(value, index, O);
          if (TYPE) {
            if (IS_MAP) target[index] = result; // map
            else if (result) switch (TYPE) {
              case 3: return true;              // some
              case 5: return value;             // find
              case 6: return index;             // findIndex
              case 2: push.call(target, value); // filter
            } else if (IS_EVERY) return false;  // every
          }
        }
        return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
      };
    };

    var arrayIteration = {
      // `Array.prototype.forEach` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
      forEach: createMethod$1(0),
      // `Array.prototype.map` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.map
      map: createMethod$1(1),
      // `Array.prototype.filter` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.filter
      filter: createMethod$1(2),
      // `Array.prototype.some` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.some
      some: createMethod$1(3),
      // `Array.prototype.every` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.every
      every: createMethod$1(4),
      // `Array.prototype.find` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.find
      find: createMethod$1(5),
      // `Array.prototype.findIndex` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
      findIndex: createMethod$1(6)
    };

    var arrayMethodIsStrict = function (METHOD_NAME, argument) {
      var method = [][METHOD_NAME];
      return !!method && fails(function () {
        // eslint-disable-next-line no-useless-call,no-throw-literal
        method.call(null, argument || function () { throw 1; }, 1);
      });
    };

    var $forEach = arrayIteration.forEach;



    var STRICT_METHOD = arrayMethodIsStrict('forEach');
    var USES_TO_LENGTH$1 = arrayMethodUsesToLength('forEach');

    // `Array.prototype.forEach` method implementation
    // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
    var arrayForEach = (!STRICT_METHOD || !USES_TO_LENGTH$1) ? function forEach(callbackfn /* , thisArg */) {
      return $forEach(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    } : [].forEach;

    // `Array.prototype.forEach` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
    _export({ target: 'Array', proto: true, forced: [].forEach != arrayForEach }, {
      forEach: arrayForEach
    });

    // iterable DOM collections
    // flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
    var domIterables = {
      CSSRuleList: 0,
      CSSStyleDeclaration: 0,
      CSSValueList: 0,
      ClientRectList: 0,
      DOMRectList: 0,
      DOMStringList: 0,
      DOMTokenList: 1,
      DataTransferItemList: 0,
      FileList: 0,
      HTMLAllCollection: 0,
      HTMLCollection: 0,
      HTMLFormElement: 0,
      HTMLSelectElement: 0,
      MediaList: 0,
      MimeTypeArray: 0,
      NamedNodeMap: 0,
      NodeList: 1,
      PaintRequestList: 0,
      Plugin: 0,
      PluginArray: 0,
      SVGLengthList: 0,
      SVGNumberList: 0,
      SVGPathSegList: 0,
      SVGPointList: 0,
      SVGStringList: 0,
      SVGTransformList: 0,
      SourceBufferList: 0,
      StyleSheetList: 0,
      TextTrackCueList: 0,
      TextTrackList: 0,
      TouchList: 0
    };

    for (var COLLECTION_NAME in domIterables) {
      var Collection = global_1[COLLECTION_NAME];
      var CollectionPrototype = Collection && Collection.prototype;
      // some Chrome versions have non-configurable methods on DOMTokenList
      if (CollectionPrototype && CollectionPrototype.forEach !== arrayForEach) try {
        createNonEnumerableProperty(CollectionPrototype, 'forEach', arrayForEach);
      } catch (error) {
        CollectionPrototype.forEach = arrayForEach;
      }
    }

    var instruments = ["bass", "drums", "guitar", "harp", "piano", "violin", "cello", "flute", "trumpet", "clarinet"];
    var instrumentSettings = {
      bass: {
        color: "rgba(255, 0, 0, 1)"
      },
      drums: {
        color: "rgba(0, 255, 0, 1)"
      },
      guitar: {
        color: "rgba(0, 0, 255, 1)"
      },
      harp: {
        color: "rgba(255, 150, 0, 1)"
      },
      piano: {
        color: "rgba(0, 255, 255, 1)"
      },
      violin: {
        color: "rgba(255, 0, 255, 1)"
      },
      cello: {
        color: "rgba(255, 0, 255, 1)"
      },
      flute: {
        color: "rgba(255, 255, 255, 1)"
      },
      trumpet: {
        color: "rgba(255, 255, 255, 1)"
      },
      clarinet: {
        color: "rgba(255, 255, 255, 1)"
      }
    };
    var instrumentCategories = ["bass", "drums", "guitar", "harp", "piano", "strings", "winds"];
    var genres = ["chopin", "mozart", "rachmaninoff", "ladygaga", "country", "disney", "jazz", "bach", "beethoven", "journey", "thebeatles", "video", "broadway", "franksinatra", "bluegrass", "tchaikovsky", "liszt", "everything", "ragtime", "andrehazes", "cocciante", "thecranberries", "ligabue", "metallica", "traffic", "philcollins", "nineinchnails", "thepretenders", "sugarray", "grandfunkrailroad", "ron", "ellington", "fleetwoodmac", "thebeachboys", "kool & the gang", "foreigner", "tlc", "scottjames", "benfoldsfive", "smashmouth", "oasis", "allsaints", "donnasummer", "weezer", "bjork", "mariahcarey", "berte", "cheaptrick", "caroleking", "thecars", "gganderson", "robertpalmer", "zucchero", "alicecooper", "vanhalen", "brucehornsby", "coolio", "jimmybuffett", "lobo", "badcompany", "eminem", "creedenceclearwaterrevival", "deeppurple", "shearinggeorge", "robbiewilliams", "dalla", "ub40", "lindaronstadt", "sinatra", "inxs", "jonimitchell", "michaeljackson", "last", "devo", "shaniatwain", "korn", "brooksgarth", "sweet", "thewho", "roxette", "bowiedavid", "beegees", "renefroger", "mina", "estefangloria", "mccartney", "theventures", "carboni", "simplyred", "santana", "jewel", "meatloaf", "giorgia", "nofx", "rickymartin", "thecure", "thetemptations", "tozzi", "beck", "eiffel65", "jenniferlopez", "reelbigfish", "patsycline", "richardcliff", "styx", "acdc", "brucespringsteen", "michaelgeorge", "blondie", "pinkfloyd", "oldfieldmike", "redhotchilipeppers", "therollingstones", "morandi", "heart", "robertaflack", "pantera", "alabama", "jethrotull", "hanson", "mosch", "ludwigvanbeethoven", "dvorak", "chrisrea", "guns n' roses", "duranduran", "ericclapton", "bettemidler", "bwitched", "gordonlightfoot", "thegrassroots", "chicago", "whitezombie", "michaelbolton", "paulsimon", "marillion", "thepointersisters", "theanimals", "cher", "haydn", "aerosmith", "supertramp", "littleriverband", "america", "tonyorlando", "tompetty", "thecorrs", "aliceinchains", "kiss", "prince", "toto", "vanmorrison", "wagner", "cashjohnny", "annielennox", "enya", "thedoobiebrothers", "thetragicallyhip", "rush", "laurapausini", "stevemillerband", "simonandgarfunkel", "fiorellamannoia", "olivianewton-john", "carlysimon", "elvispresley", "vangelis", "bobdylan", "bbking", "vengaboys", "paoli", "thehollies", "alainsouchon", "pooh", "raf", "fiorello", "lionelrichie", "jimihendrix", "theeverlybrothers", "limpbizkit", "donhenley", "georgeharrison", "threedognight", "johnmellencamp", "carpenters", "raycharles", "basie", "billyocean", "scorpions", "royorbison", "whitneyhouston", "ironmaiden", "jovanotti", "alanjackson", "barrymanilow", "hueylewis", "kennyloggins", "chopinfrederic", "talkingheads", "themonkees", "rem", "jeanmicheljarre", "michelezarrillo", "eurythmics", "thedoors", "guesswho", "miller", "thefourseasons", "matiabazar", "tompettyandtheheartbreakers", "chickcorea", "scottjoplin", "amedeominghi", "bryanadams", "paulaabdul", "rossivasco", "billyjoel", "daniele", "claudedebussy", "gilbert & sullivan", "chakakhan", "nirvana", "garbage", "andreabocelli", "johnnyrivers", "emerson, lake & palmer", "theallmanbrothersband", "zappa", "boston", "mango", "barbrastreisand", "willsmith", "ozzyosbourne", "janetjackson", "antonellovenditti", "u2", "humperdinckengelbert", "jamiroquai", "zero", "chuckberry", "spicegirls", "ledzeppelin", "masini", "thekinks", "eagles", "billyidol", "alanismorissette", "joecocker", "jimcroce", "bobmarley", "blacksabbath", "stonetemplepilots", "silverchair", "paulmccartney", "blur", "nek", "greenday", "thepolice", "depechemode", "rageagainstthemachine", "madonna", "rogerskenny", "brooks & dunn", "883", "thedrifters", "amygrant", "herman", "toriamos", "eltonjohn", "britneyspears", "lennykravitz", "celentano", "ringostarr", "neildiamond", "aqua", "oscarpeterson", "joejackson", "moby", "collinsphil", "leosayer", "takethat", "electriclightorchestra", "pearljam", "marcanthony", "borodin", "petshopboys", "stevienicks", "hollybuddy", "turnertina", "annaoxa", "zztop", "sting", "themoodyblues", "ruggeri", "creed", "claudebolling", "renzoarbore", "erasure", "elviscostello", "airsupply", "tinaturner", "leali", "petergabriel", "nodoubt", "bread", "huey lewis & the news", "brandy", "level42", "radiohead", "georgebenson", "wonderstevie", "thesmashingpumpkins", "cyndilauper", "rodstewart", "bush", "ramazzotti", "bobseger", "theshadows", "gershwin", "cream", "biagioantonacci", "steviewonder", "nomadi", "direstraits", "davidbowie", "amostori", "thealanparsonsproject", "johnlennon", "crosbystillsnashandyoung", "battiato", "kansas", "clementi", "richielionel", "yes", "brassensgeorges", "steelydan", "jacksonmichael", "buddyholly", "earthwindandfire", "natkingcole", "therascals", "bonjovi", "alanparsons", "backstreetboys", "glencampbell", "howardcarpendale", "thesupremes", "villagepeople", "blink-182", "jacksonbrowne", "sade", "lynyrdskynyrd", "foofighters", "2unlimited", "battisti", "hall & oates", "stansfieldlisa", "genesis", "boyzone", "theoffspring", "tomjones", "davematthewsband", "johnelton", "neilyoung", "dionnewarwick", "aceofbase", "marilynmanson", "taylorjames", "rkelly", "grandi", "sublime", "edvardgrieg", "tool", "bachjohannsebastian", "patbenatar", "celinedion", "queen", "soundgarden", "abba", "drdre", "defleppard", "dominofats", "realmccoy", "natalieimbruglia", "hole", "spinners", "arethafranklin", "reospeedwagon", "indian", "movie", "scottish", "irish", "african", "taylorswift", "shakira", "blues", "latin", "katyperry", "world", "kpop", "africandrum", "michaelbuble", "rihanna", "gospel", "beyonce", "chinese", "arabic", "adele", "kellyclarkson", "theeagles", "handel", "rachmaninov", "schumann", "christmas", "dance", "punk", "natl_anthem", "brahms", "rap", "ravel", "burgmueller", "other", "schubert", "granados", "albeniz", "mendelssohn", "debussy", "grieg", "moszkowski", "godowsky", "folk", "mussorgsky", "kids", "balakirev", "hymns", "verdi", "hummel", "deleted", "delibes", "saint-saens", "puccini", "satie", "offenbach", "widor", "songs", "stravinsky", "vivaldi", "gurlitt", "alkan", "weber", "strauss", "traditional", "rossini", "mahler", "soler", "sousa", "telemann", "busoni", "scarlatti", "stamitz", "classical", "jstrauss2", "gabrieli", "nielsen", "purcell", "donizetti", "kuhlau", "gounod", "gibbons", "weiss", "faure", "holst", "spohr", "monteverdi", "reger", "bizet", "elgar", "czerny", "sullivan", "shostakovich", "franck", "rubinstein", "albrechtsberger", "paganini", "diabelli", "gottschalk", "wieniawski", "lully", "morley", "sibelius", "scriabin", "heller", "thalberg", "dowland", "carulli", "pachelbel", "sor", "marcello", "ketterer", "rimsky-korsakov", "ascher", "bruckner", "janequin", "anonymous", "kreutzer", "sanz", "joplin", "susato", "giuliani", "lassus", "palestrina", "smetana", "berlioz", "couperin", "gomolka", "daquin", "herz", "campion", "walthew", "pergolesi", "reicha", "polak", "holborne", "hassler", "corelli", "cato", "azzaiolo", "anerio", "gastoldi", "goudimel", "dussek", "prez", "cimarosa", "byrd", "praetorius", "rameau", "khachaturian", "machaut", "gade", "perosi", "gorzanis", "smith", "haberbier", "carr", "marais", "glazunov", "guerrero", "cabanilles", "losy", "roman", "hasse", "sammartini", "blow", "zipoli", "duvernoy", "aguado", "cherubini", "victoria", "field", "andersen", "poulenc", "d'aragona", "lemire", "krakowa", "maier", "rimini", "encina", "banchieri", "best", "galilei", "warhorse", "gypsy", "soundtrack", "encore", "roblaidlow", "nationalanthems", "benjyshelton", "ongcmu", "crosbystillsnashyoung", "smashingpumpkins", "aaaaaaaaaaa", "alanismorrisette", "animenz", "onedirection", "nintendo", "disneythemes", "gunsnroses", "rollingstones", "juliancasablancas", "abdelmoinealfa", "berckmansdeoliveira", "moviethemes", "beachboys", "davemathews", "videogamethemes", "moabberckmansdeoliveira", "unknown", "cameronleesimpson", "johannsebastianbach", "thecarpenters", "elo", "nightwish", "blink182", "emersonlakeandpalmer", "tvthemes"];
    var pitchMin = 20;
    var pitchMax = 120;
    var pitchRange = pitchMax - pitchMin;

    function createEmptyNotes() {
      var notes = {};
      instruments.forEach(function (instrument) {
        return notes[instrument] = [];
      });
      return notes;
    }
    function createRootNotesStore() {
      return writable({
        notes: createEmptyNotes()
      });
    }
    function createBranchNotesStore(parent, sectionStore) {
      return derived([parent, sectionStore], function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            $parent = _ref2[0],
            $sectionStore = _ref2[1];

        var parentNotes = $parent.notes;
        var childNotes = $sectionStore.section.notes;
        var combinedNotes = createEmptyNotes();
        instruments.forEach(function (instrument) {
          combinedNotes[instrument] = [].concat(_toConsumableArray(parentNotes[instrument]), _toConsumableArray(childNotes[instrument]));
        });
        return {
          notes: combinedNotes
        };
      });
    }
    function createNotesStore(parent, sectionStore) {
      if (parent === null) {
        return createRootNotesStore();
      } else if (parent.type === "root") {
        return createBranchNotesStore(createRootNotesStore(), sectionStore);
      } else {
        return createBranchNotesStore(parent, sectionStore);
      }
    }

    var rootStateDecorationStore = writable({
      pendingLoad: 0
    });
    var root = createTree(rootStateDecorationStore, createRootStoreDecorationSupplier(rootStateDecorationStore));

    function deriveBranchStateDecorationStore(parentStore, sectionStore, pendingLoadStore) {
      var encodingStore = createEncodingStore(parentStore, sectionStore);
      var notesStore = createNotesStore(parentStore, sectionStore);
      return derived([sectionStore, encodingStore, notesStore, pendingLoadStore], function (_ref) {
        var _ref2 = _slicedToArray(_ref, 4),
            $sectionStore = _ref2[0],
            $encodingStore = _ref2[1],
            $notesStore = _ref2[2],
            $pendingLoadStore = _ref2[3];

        return _objectSpread2(_objectSpread2(_objectSpread2(_objectSpread2({}, $sectionStore), $encodingStore), $notesStore), $pendingLoadStore);
      });
    }

    function createRootStoreDecorationSupplier(pendingLoadStore) {
      return function (partDecoratedStore) {
        return {
          addChild: function addChild(sectionStore) {
            var pendingLoadStore = writable({
              pendingLoad: 0
            });
            partDecoratedStore.addChild(deriveBranchStateDecorationStore(partDecoratedStore, sectionStore, pendingLoadStore), createBranchStoreDecorationSupplier(pendingLoadStore));
          },
          updatePendingLoad: function updatePendingLoad(updater) {
            pendingLoadStore.update(function (state) {
              return _objectSpread2(_objectSpread2({}, state), {}, {
                pendingLoad: updater(state.pendingLoad)
              });
            });
          }
        };
      };
    }

    function createBranchStoreDecorationSupplier(pendingLoadStore) {
      return function (partDecoratedStore) {
        return {
          addChild: function addChild(sectionStore) {
            var pendingLoadStore = writable({
              pendingLoad: 0
            });
            partDecoratedStore.addChild(deriveBranchStateDecorationStore(partDecoratedStore, sectionStore, pendingLoadStore), createBranchStoreDecorationSupplier(pendingLoadStore));
          },
          updatePendingLoad: function updatePendingLoad(updater) {
            pendingLoadStore.update(function (state) {
              return _objectSpread2(_objectSpread2({}, state), {}, {
                pendingLoad: updater(state.pendingLoad)
              });
            });
          }
        };
      };
    }

    var selectedBranchStore = unwrapStore(root.selectedStore_2, function (a, b) {
      return arraysEqual(a.path, b.path);
    });
    var selectedPathStore = derived(selectedBranchStore, function (state) {
      return state === null ? null : state.path;
    });

    function arraysEqual(a, b) {
      if (a === b) return true;
      if (a == null || b == null) return false;
      if (a.length != b.length) return false;

      for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
      }

      return true;
    }

    /* src/track/ChildButton.svelte generated by Svelte v3.21.0 */
    const file = "src/track/ChildButton.svelte";

    function create_fragment(ctx) {
    	let button;
    	let t;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(/*index*/ ctx[3]);
    			attr_dev(button, "class", "childButton svelte-1y6ezv4");
    			toggle_class(button, "selected", /*selected*/ ctx[2]);
    			add_location(button, file, 40, 0, 1447);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button, "click", /*select*/ ctx[4], false, false, false),
    				listen_dev(
    					button,
    					"contextmenu",
    					prevent_default(function () {
    						if (is_function(/*remove*/ ctx[1])) /*remove*/ ctx[1].apply(this, arguments);
    					}),
    					false,
    					true,
    					false
    				)
    			];
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*index*/ 8) set_data_dev(t, /*index*/ ctx[3]);

    			if (dirty & /*selected*/ 4) {
    				toggle_class(button, "selected", /*selected*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			run_all(dispose);
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
    	let $nodeStore,
    		$$unsubscribe_nodeStore = noop,
    		$$subscribe_nodeStore = () => ($$unsubscribe_nodeStore(), $$unsubscribe_nodeStore = subscribe(nodeStore, $$value => $$invalidate(6, $nodeStore = $$value)), nodeStore);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_nodeStore());
    	let { nodeStore } = $$props;
    	validate_store(nodeStore, "nodeStore");
    	$$subscribe_nodeStore();
    	let { remove } = $$props;

    	// $: startsAt = $parentNodeStore.track ? $parentNodeStore.track.endsAt : 0;
    	function select() {
    		root.select(path);
    	} //   const playFrom = Math.max(0, startsAt - $preplayStore);
    	//   if ($autoPlayStore) {

    	const writable_props = ["nodeStore", "remove"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ChildButton> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ChildButton", $$slots, []);

    	$$self.$set = $$props => {
    		if ("nodeStore" in $$props) $$subscribe_nodeStore($$invalidate(0, nodeStore = $$props.nodeStore));
    		if ("remove" in $$props) $$invalidate(1, remove = $$props.remove);
    	};

    	$$self.$capture_state = () => ({
    		root,
    		nodeStore,
    		remove,
    		select,
    		state,
    		$nodeStore,
    		selected,
    		path,
    		index
    	});

    	$$self.$inject_state = $$props => {
    		if ("nodeStore" in $$props) $$subscribe_nodeStore($$invalidate(0, nodeStore = $$props.nodeStore));
    		if ("remove" in $$props) $$invalidate(1, remove = $$props.remove);
    		if ("state" in $$props) $$invalidate(5, state = $$props.state);
    		if ("selected" in $$props) $$invalidate(2, selected = $$props.selected);
    		if ("path" in $$props) $$invalidate(7, path = $$props.path);
    		if ("index" in $$props) $$invalidate(3, index = $$props.index);
    	};

    	let state;
    	let selected;
    	let path;
    	let index;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$nodeStore*/ 64) {
    			 $$invalidate(5, state = $nodeStore);
    		}

    		if ($$self.$$.dirty & /*state*/ 32) {
    			 $$invalidate(2, selected = state.wasLastSelectedByParent);
    		}

    		if ($$self.$$.dirty & /*state*/ 32) {
    			 $$invalidate(7, path = state.path);
    		}

    		if ($$self.$$.dirty & /*path*/ 128) {
    			 $$invalidate(3, index = path[path.length - 1]);
    		}
    	};

    	return [nodeStore, remove, selected, index, select];
    }

    class ChildButton extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { nodeStore: 0, remove: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ChildButton",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*nodeStore*/ ctx[0] === undefined && !("nodeStore" in props)) {
    			console.warn("<ChildButton> was created without expected prop 'nodeStore'");
    		}

    		if (/*remove*/ ctx[1] === undefined && !("remove" in props)) {
    			console.warn("<ChildButton> was created without expected prop 'remove'");
    		}
    	}

    	get nodeStore() {
    		throw new Error("<ChildButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set nodeStore(value) {
    		throw new Error("<ChildButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get remove() {
    		throw new Error("<ChildButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set remove(value) {
    		throw new Error("<ChildButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // `Array.prototype.{ reduce, reduceRight }` methods implementation
    var createMethod$2 = function (IS_RIGHT) {
      return function (that, callbackfn, argumentsLength, memo) {
        aFunction$1(callbackfn);
        var O = toObject(that);
        var self = indexedObject(O);
        var length = toLength(O.length);
        var index = IS_RIGHT ? length - 1 : 0;
        var i = IS_RIGHT ? -1 : 1;
        if (argumentsLength < 2) while (true) {
          if (index in self) {
            memo = self[index];
            index += i;
            break;
          }
          index += i;
          if (IS_RIGHT ? index < 0 : length <= index) {
            throw TypeError('Reduce of empty array with no initial value');
          }
        }
        for (;IS_RIGHT ? index >= 0 : length > index; index += i) if (index in self) {
          memo = callbackfn(memo, self[index], index, O);
        }
        return memo;
      };
    };

    var arrayReduce = {
      // `Array.prototype.reduce` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.reduce
      left: createMethod$2(false),
      // `Array.prototype.reduceRight` method
      // https://tc39.github.io/ecma262/#sec-array.prototype.reduceright
      right: createMethod$2(true)
    };

    var $reduce = arrayReduce.left;



    var STRICT_METHOD$1 = arrayMethodIsStrict('reduce');
    var USES_TO_LENGTH$2 = arrayMethodUsesToLength('reduce', { 1: 0 });

    // `Array.prototype.reduce` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.reduce
    _export({ target: 'Array', proto: true, forced: !STRICT_METHOD$1 || !USES_TO_LENGTH$2 }, {
      reduce: function reduce(callbackfn /* , initialValue */) {
        return $reduce(this, callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
      }
    });

    // `Object.keys` method
    // https://tc39.github.io/ecma262/#sec-object.keys
    var objectKeys = Object.keys || function keys(O) {
      return objectKeysInternal(O, enumBugKeys);
    };

    var propertyIsEnumerable = objectPropertyIsEnumerable.f;

    // `Object.{ entries, values }` methods implementation
    var createMethod$3 = function (TO_ENTRIES) {
      return function (it) {
        var O = toIndexedObject(it);
        var keys = objectKeys(O);
        var length = keys.length;
        var i = 0;
        var result = [];
        var key;
        while (length > i) {
          key = keys[i++];
          if (!descriptors || propertyIsEnumerable.call(O, key)) {
            result.push(TO_ENTRIES ? [key, O[key]] : O[key]);
          }
        }
        return result;
      };
    };

    var objectToArray = {
      // `Object.entries` method
      // https://tc39.github.io/ecma262/#sec-object.entries
      entries: createMethod$3(true),
      // `Object.values` method
      // https://tc39.github.io/ecma262/#sec-object.values
      values: createMethod$3(false)
    };

    var $values = objectToArray.values;

    // `Object.values` method
    // https://tc39.github.io/ecma262/#sec-object.values
    _export({ target: 'Object', stat: true }, {
      values: function values(O) {
        return $values(O);
      }
    });

    var instrumentStores = instrumentCategories.reduce(function (acc, instrument) {
      acc[instrument] = writable(instrument === "piano" || instrument === "drums");
      return acc;
    }, {});
    var instrumentStoreValues = Object.values(instrumentStores);
    var instrumentsStore = derived(instrumentStoreValues, function (enabledArray) {
      return enabledArray.reduce(function (acc, enabled, idx) {
        acc[instrumentCategories[idx]] = enabled;
        return acc;
      }, {});
    });
    var generationLengthStore = writable(300);
    var genreStore = writable("broadway");
    var temperatureStore = writable(1);
    var truncationStore = writable(27);
    var autoRequestStore = writable(false);
    var autoScrollStore = writable(true);
    var isScrollingStore = writable(false);
    var autoPlayStore = writable(true);
    var preplayStore = writable(2.5);
    var yScaleStore = writable(100);
    var configStore = derived([generationLengthStore, genreStore, instrumentsStore, temperatureStore, truncationStore], function (_ref) {
      var _ref2 = _slicedToArray(_ref, 5),
          $generationLengthStore = _ref2[0],
          $genreStore = _ref2[1],
          $instrumentsStore = _ref2[2],
          $temperatureStore = _ref2[3],
          $truncationStore = _ref2[4];

      return {
        audioFormat: "mp3",
        encoding: [],
        generationLength: $generationLengthStore,
        genre: $genreStore,
        instrument: $instrumentsStore,
        temperature: $temperatureStore,
        truncation: $truncationStore
      };
    });

    var $filter = arrayIteration.filter;



    var HAS_SPECIES_SUPPORT$1 = arrayMethodHasSpeciesSupport('filter');
    // Edge 14- issue
    var USES_TO_LENGTH$3 = arrayMethodUsesToLength('filter');

    // `Array.prototype.filter` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.filter
    // with adding support of @@species
    _export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$1 || !USES_TO_LENGTH$3 }, {
      filter: function filter(callbackfn /* , thisArg */) {
        return $filter(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
      }
    });

    // `Object.defineProperties` method
    // https://tc39.github.io/ecma262/#sec-object.defineproperties
    var objectDefineProperties = descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
      anObject(O);
      var keys = objectKeys(Properties);
      var length = keys.length;
      var index = 0;
      var key;
      while (length > index) objectDefineProperty.f(O, key = keys[index++], Properties[key]);
      return O;
    };

    var html = getBuiltIn('document', 'documentElement');

    var GT = '>';
    var LT = '<';
    var PROTOTYPE = 'prototype';
    var SCRIPT = 'script';
    var IE_PROTO = sharedKey('IE_PROTO');

    var EmptyConstructor = function () { /* empty */ };

    var scriptTag = function (content) {
      return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
    };

    // Create object with fake `null` prototype: use ActiveX Object with cleared prototype
    var NullProtoObjectViaActiveX = function (activeXDocument) {
      activeXDocument.write(scriptTag(''));
      activeXDocument.close();
      var temp = activeXDocument.parentWindow.Object;
      activeXDocument = null; // avoid memory leak
      return temp;
    };

    // Create object with fake `null` prototype: use iframe Object with cleared prototype
    var NullProtoObjectViaIFrame = function () {
      // Thrash, waste and sodomy: IE GC bug
      var iframe = documentCreateElement('iframe');
      var JS = 'java' + SCRIPT + ':';
      var iframeDocument;
      iframe.style.display = 'none';
      html.appendChild(iframe);
      // https://github.com/zloirock/core-js/issues/475
      iframe.src = String(JS);
      iframeDocument = iframe.contentWindow.document;
      iframeDocument.open();
      iframeDocument.write(scriptTag('document.F=Object'));
      iframeDocument.close();
      return iframeDocument.F;
    };

    // Check for document.domain and active x support
    // No need to use active x approach when document.domain is not set
    // see https://github.com/es-shims/es5-shim/issues/150
    // variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
    // avoid IE GC bug
    var activeXDocument;
    var NullProtoObject = function () {
      try {
        /* global ActiveXObject */
        activeXDocument = document.domain && new ActiveXObject('htmlfile');
      } catch (error) { /* ignore */ }
      NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
      var length = enumBugKeys.length;
      while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
      return NullProtoObject();
    };

    hiddenKeys[IE_PROTO] = true;

    // `Object.create` method
    // https://tc39.github.io/ecma262/#sec-object.create
    var objectCreate = Object.create || function create(O, Properties) {
      var result;
      if (O !== null) {
        EmptyConstructor[PROTOTYPE] = anObject(O);
        result = new EmptyConstructor();
        EmptyConstructor[PROTOTYPE] = null;
        // add "__proto__" for Object.getPrototypeOf polyfill
        result[IE_PROTO] = O;
      } else result = NullProtoObject();
      return Properties === undefined ? result : objectDefineProperties(result, Properties);
    };

    var UNSCOPABLES = wellKnownSymbol('unscopables');
    var ArrayPrototype = Array.prototype;

    // Array.prototype[@@unscopables]
    // https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
    if (ArrayPrototype[UNSCOPABLES] == undefined) {
      objectDefineProperty.f(ArrayPrototype, UNSCOPABLES, {
        configurable: true,
        value: objectCreate(null)
      });
    }

    // add a key to Array.prototype[@@unscopables]
    var addToUnscopables = function (key) {
      ArrayPrototype[UNSCOPABLES][key] = true;
    };

    var iterators = {};

    var correctPrototypeGetter = !fails(function () {
      function F() { /* empty */ }
      F.prototype.constructor = null;
      return Object.getPrototypeOf(new F()) !== F.prototype;
    });

    var IE_PROTO$1 = sharedKey('IE_PROTO');
    var ObjectPrototype = Object.prototype;

    // `Object.getPrototypeOf` method
    // https://tc39.github.io/ecma262/#sec-object.getprototypeof
    var objectGetPrototypeOf = correctPrototypeGetter ? Object.getPrototypeOf : function (O) {
      O = toObject(O);
      if (has(O, IE_PROTO$1)) return O[IE_PROTO$1];
      if (typeof O.constructor == 'function' && O instanceof O.constructor) {
        return O.constructor.prototype;
      } return O instanceof Object ? ObjectPrototype : null;
    };

    var ITERATOR = wellKnownSymbol('iterator');
    var BUGGY_SAFARI_ITERATORS = false;

    var returnThis = function () { return this; };

    // `%IteratorPrototype%` object
    // https://tc39.github.io/ecma262/#sec-%iteratorprototype%-object
    var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

    if ([].keys) {
      arrayIterator = [].keys();
      // Safari 8 has buggy iterators w/o `next`
      if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
      else {
        PrototypeOfArrayIteratorPrototype = objectGetPrototypeOf(objectGetPrototypeOf(arrayIterator));
        if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
      }
    }

    if (IteratorPrototype == undefined) IteratorPrototype = {};

    // 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
    if ( !has(IteratorPrototype, ITERATOR)) {
      createNonEnumerableProperty(IteratorPrototype, ITERATOR, returnThis);
    }

    var iteratorsCore = {
      IteratorPrototype: IteratorPrototype,
      BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
    };

    var defineProperty$1 = objectDefineProperty.f;



    var TO_STRING_TAG = wellKnownSymbol('toStringTag');

    var setToStringTag = function (it, TAG, STATIC) {
      if (it && !has(it = STATIC ? it : it.prototype, TO_STRING_TAG)) {
        defineProperty$1(it, TO_STRING_TAG, { configurable: true, value: TAG });
      }
    };

    var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;





    var returnThis$1 = function () { return this; };

    var createIteratorConstructor = function (IteratorConstructor, NAME, next) {
      var TO_STRING_TAG = NAME + ' Iterator';
      IteratorConstructor.prototype = objectCreate(IteratorPrototype$1, { next: createPropertyDescriptor(1, next) });
      setToStringTag(IteratorConstructor, TO_STRING_TAG, false);
      iterators[TO_STRING_TAG] = returnThis$1;
      return IteratorConstructor;
    };

    var aPossiblePrototype = function (it) {
      if (!isObject(it) && it !== null) {
        throw TypeError("Can't set " + String(it) + ' as a prototype');
      } return it;
    };

    // `Object.setPrototypeOf` method
    // https://tc39.github.io/ecma262/#sec-object.setprototypeof
    // Works with __proto__ only. Old v8 can't work with null proto objects.
    /* eslint-disable no-proto */
    var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
      var CORRECT_SETTER = false;
      var test = {};
      var setter;
      try {
        setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
        setter.call(test, []);
        CORRECT_SETTER = test instanceof Array;
      } catch (error) { /* empty */ }
      return function setPrototypeOf(O, proto) {
        anObject(O);
        aPossiblePrototype(proto);
        if (CORRECT_SETTER) setter.call(O, proto);
        else O.__proto__ = proto;
        return O;
      };
    }() : undefined);

    var IteratorPrototype$2 = iteratorsCore.IteratorPrototype;
    var BUGGY_SAFARI_ITERATORS$1 = iteratorsCore.BUGGY_SAFARI_ITERATORS;
    var ITERATOR$1 = wellKnownSymbol('iterator');
    var KEYS = 'keys';
    var VALUES = 'values';
    var ENTRIES = 'entries';

    var returnThis$2 = function () { return this; };

    var defineIterator = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
      createIteratorConstructor(IteratorConstructor, NAME, next);

      var getIterationMethod = function (KIND) {
        if (KIND === DEFAULT && defaultIterator) return defaultIterator;
        if (!BUGGY_SAFARI_ITERATORS$1 && KIND in IterablePrototype) return IterablePrototype[KIND];
        switch (KIND) {
          case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
          case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
          case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
        } return function () { return new IteratorConstructor(this); };
      };

      var TO_STRING_TAG = NAME + ' Iterator';
      var INCORRECT_VALUES_NAME = false;
      var IterablePrototype = Iterable.prototype;
      var nativeIterator = IterablePrototype[ITERATOR$1]
        || IterablePrototype['@@iterator']
        || DEFAULT && IterablePrototype[DEFAULT];
      var defaultIterator = !BUGGY_SAFARI_ITERATORS$1 && nativeIterator || getIterationMethod(DEFAULT);
      var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
      var CurrentIteratorPrototype, methods, KEY;

      // fix native
      if (anyNativeIterator) {
        CurrentIteratorPrototype = objectGetPrototypeOf(anyNativeIterator.call(new Iterable()));
        if (IteratorPrototype$2 !== Object.prototype && CurrentIteratorPrototype.next) {
          if ( objectGetPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype$2) {
            if (objectSetPrototypeOf) {
              objectSetPrototypeOf(CurrentIteratorPrototype, IteratorPrototype$2);
            } else if (typeof CurrentIteratorPrototype[ITERATOR$1] != 'function') {
              createNonEnumerableProperty(CurrentIteratorPrototype, ITERATOR$1, returnThis$2);
            }
          }
          // Set @@toStringTag to native iterators
          setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true);
        }
      }

      // fix Array#{values, @@iterator}.name in V8 / FF
      if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
        INCORRECT_VALUES_NAME = true;
        defaultIterator = function values() { return nativeIterator.call(this); };
      }

      // define iterator
      if ( IterablePrototype[ITERATOR$1] !== defaultIterator) {
        createNonEnumerableProperty(IterablePrototype, ITERATOR$1, defaultIterator);
      }
      iterators[NAME] = defaultIterator;

      // export additional methods
      if (DEFAULT) {
        methods = {
          values: getIterationMethod(VALUES),
          keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
          entries: getIterationMethod(ENTRIES)
        };
        if (FORCED) for (KEY in methods) {
          if (BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
            redefine(IterablePrototype, KEY, methods[KEY]);
          }
        } else _export({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME }, methods);
      }

      return methods;
    };

    var ARRAY_ITERATOR = 'Array Iterator';
    var setInternalState = internalState.set;
    var getInternalState = internalState.getterFor(ARRAY_ITERATOR);

    // `Array.prototype.entries` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.entries
    // `Array.prototype.keys` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.keys
    // `Array.prototype.values` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.values
    // `Array.prototype[@@iterator]` method
    // https://tc39.github.io/ecma262/#sec-array.prototype-@@iterator
    // `CreateArrayIterator` internal method
    // https://tc39.github.io/ecma262/#sec-createarrayiterator
    var es_array_iterator = defineIterator(Array, 'Array', function (iterated, kind) {
      setInternalState(this, {
        type: ARRAY_ITERATOR,
        target: toIndexedObject(iterated), // target
        index: 0,                          // next index
        kind: kind                         // kind
      });
    // `%ArrayIteratorPrototype%.next` method
    // https://tc39.github.io/ecma262/#sec-%arrayiteratorprototype%.next
    }, function () {
      var state = getInternalState(this);
      var target = state.target;
      var kind = state.kind;
      var index = state.index++;
      if (!target || index >= target.length) {
        state.target = undefined;
        return { value: undefined, done: true };
      }
      if (kind == 'keys') return { value: index, done: false };
      if (kind == 'values') return { value: target[index], done: false };
      return { value: [index, target[index]], done: false };
    }, 'values');

    // argumentsList[@@iterator] is %ArrayProto_values%
    // https://tc39.github.io/ecma262/#sec-createunmappedargumentsobject
    // https://tc39.github.io/ecma262/#sec-createmappedargumentsobject
    iterators.Arguments = iterators.Array;

    // https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
    addToUnscopables('keys');
    addToUnscopables('values');
    addToUnscopables('entries');

    var nativeJoin = [].join;

    var ES3_STRINGS = indexedObject != Object;
    var STRICT_METHOD$2 = arrayMethodIsStrict('join', ',');

    // `Array.prototype.join` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.join
    _export({ target: 'Array', proto: true, forced: ES3_STRINGS || !STRICT_METHOD$2 }, {
      join: function join(separator) {
        return nativeJoin.call(toIndexedObject(this), separator === undefined ? ',' : separator);
      }
    });

    var $map = arrayIteration.map;



    var HAS_SPECIES_SUPPORT$2 = arrayMethodHasSpeciesSupport('map');
    // FF49- issue
    var USES_TO_LENGTH$4 = arrayMethodUsesToLength('map');

    // `Array.prototype.map` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.map
    // with adding support of @@species
    _export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$2 || !USES_TO_LENGTH$4 }, {
      map: function map(callbackfn /* , thisArg */) {
        return $map(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
      }
    });

    var DatePrototype = Date.prototype;
    var INVALID_DATE = 'Invalid Date';
    var TO_STRING = 'toString';
    var nativeDateToString = DatePrototype[TO_STRING];
    var getTime = DatePrototype.getTime;

    // `Date.prototype.toString` method
    // https://tc39.github.io/ecma262/#sec-date.prototype.tostring
    if (new Date(NaN) + '' != INVALID_DATE) {
      redefine(DatePrototype, TO_STRING, function toString() {
        var value = getTime.call(this);
        // eslint-disable-next-line no-self-compare
        return value === value ? nativeDateToString.call(this) : INVALID_DATE;
      });
    }

    var TO_STRING_TAG$1 = wellKnownSymbol('toStringTag');
    var test = {};

    test[TO_STRING_TAG$1] = 'z';

    var toStringTagSupport = String(test) === '[object z]';

    var TO_STRING_TAG$2 = wellKnownSymbol('toStringTag');
    // ES3 wrong here
    var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';

    // fallback for IE11 Script Access Denied error
    var tryGet = function (it, key) {
      try {
        return it[key];
      } catch (error) { /* empty */ }
    };

    // getting tag from ES6+ `Object.prototype.toString`
    var classof = toStringTagSupport ? classofRaw : function (it) {
      var O, tag, result;
      return it === undefined ? 'Undefined' : it === null ? 'Null'
        // @@toStringTag case
        : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG$2)) == 'string' ? tag
        // builtinTag case
        : CORRECT_ARGUMENTS ? classofRaw(O)
        // ES3 arguments fallback
        : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
    };

    // `Object.prototype.toString` method implementation
    // https://tc39.github.io/ecma262/#sec-object.prototype.tostring
    var objectToString = toStringTagSupport ? {}.toString : function toString() {
      return '[object ' + classof(this) + ']';
    };

    // `Object.prototype.toString` method
    // https://tc39.github.io/ecma262/#sec-object.prototype.tostring
    if (!toStringTagSupport) {
      redefine(Object.prototype, 'toString', objectToString, { unsafe: true });
    }

    // a string of all valid unicode whitespaces
    // eslint-disable-next-line max-len
    var whitespaces = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

    var whitespace = '[' + whitespaces + ']';
    var ltrim = RegExp('^' + whitespace + whitespace + '*');
    var rtrim = RegExp(whitespace + whitespace + '*$');

    // `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
    var createMethod$4 = function (TYPE) {
      return function ($this) {
        var string = String(requireObjectCoercible($this));
        if (TYPE & 1) string = string.replace(ltrim, '');
        if (TYPE & 2) string = string.replace(rtrim, '');
        return string;
      };
    };

    var stringTrim = {
      // `String.prototype.{ trimLeft, trimStart }` methods
      // https://tc39.github.io/ecma262/#sec-string.prototype.trimstart
      start: createMethod$4(1),
      // `String.prototype.{ trimRight, trimEnd }` methods
      // https://tc39.github.io/ecma262/#sec-string.prototype.trimend
      end: createMethod$4(2),
      // `String.prototype.trim` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.trim
      trim: createMethod$4(3)
    };

    var trim = stringTrim.trim;


    var $parseInt = global_1.parseInt;
    var hex = /^[+-]?0[Xx]/;
    var FORCED$1 = $parseInt(whitespaces + '08') !== 8 || $parseInt(whitespaces + '0x16') !== 22;

    // `parseInt` method
    // https://tc39.github.io/ecma262/#sec-parseint-string-radix
    var numberParseInt = FORCED$1 ? function parseInt(string, radix) {
      var S = trim(String(string));
      return $parseInt(S, (radix >>> 0) || (hex.test(S) ? 16 : 10));
    } : $parseInt;

    // `parseInt` method
    // https://tc39.github.io/ecma262/#sec-parseint-string-radix
    _export({ global: true, forced: parseInt != numberParseInt }, {
      parseInt: numberParseInt
    });

    var nativePromiseConstructor = global_1.Promise;

    var redefineAll = function (target, src, options) {
      for (var key in src) redefine(target, key, src[key], options);
      return target;
    };

    var SPECIES$3 = wellKnownSymbol('species');

    var setSpecies = function (CONSTRUCTOR_NAME) {
      var Constructor = getBuiltIn(CONSTRUCTOR_NAME);
      var defineProperty = objectDefineProperty.f;

      if (descriptors && Constructor && !Constructor[SPECIES$3]) {
        defineProperty(Constructor, SPECIES$3, {
          configurable: true,
          get: function () { return this; }
        });
      }
    };

    var anInstance = function (it, Constructor, name) {
      if (!(it instanceof Constructor)) {
        throw TypeError('Incorrect ' + (name ? name + ' ' : '') + 'invocation');
      } return it;
    };

    var ITERATOR$2 = wellKnownSymbol('iterator');
    var ArrayPrototype$1 = Array.prototype;

    // check on default Array iterator
    var isArrayIteratorMethod = function (it) {
      return it !== undefined && (iterators.Array === it || ArrayPrototype$1[ITERATOR$2] === it);
    };

    var ITERATOR$3 = wellKnownSymbol('iterator');

    var getIteratorMethod = function (it) {
      if (it != undefined) return it[ITERATOR$3]
        || it['@@iterator']
        || iterators[classof(it)];
    };

    // call something on iterator step with safe closing on error
    var callWithSafeIterationClosing = function (iterator, fn, value, ENTRIES) {
      try {
        return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
      // 7.4.6 IteratorClose(iterator, completion)
      } catch (error) {
        var returnMethod = iterator['return'];
        if (returnMethod !== undefined) anObject(returnMethod.call(iterator));
        throw error;
      }
    };

    var iterate_1 = createCommonjsModule(function (module) {
    var Result = function (stopped, result) {
      this.stopped = stopped;
      this.result = result;
    };

    var iterate = module.exports = function (iterable, fn, that, AS_ENTRIES, IS_ITERATOR) {
      var boundFunction = functionBindContext(fn, that, AS_ENTRIES ? 2 : 1);
      var iterator, iterFn, index, length, result, next, step;

      if (IS_ITERATOR) {
        iterator = iterable;
      } else {
        iterFn = getIteratorMethod(iterable);
        if (typeof iterFn != 'function') throw TypeError('Target is not iterable');
        // optimisation for array iterators
        if (isArrayIteratorMethod(iterFn)) {
          for (index = 0, length = toLength(iterable.length); length > index; index++) {
            result = AS_ENTRIES
              ? boundFunction(anObject(step = iterable[index])[0], step[1])
              : boundFunction(iterable[index]);
            if (result && result instanceof Result) return result;
          } return new Result(false);
        }
        iterator = iterFn.call(iterable);
      }

      next = iterator.next;
      while (!(step = next.call(iterator)).done) {
        result = callWithSafeIterationClosing(iterator, boundFunction, step.value, AS_ENTRIES);
        if (typeof result == 'object' && result && result instanceof Result) return result;
      } return new Result(false);
    };

    iterate.stop = function (result) {
      return new Result(true, result);
    };
    });

    var ITERATOR$4 = wellKnownSymbol('iterator');
    var SAFE_CLOSING = false;

    try {
      var called = 0;
      var iteratorWithReturn = {
        next: function () {
          return { done: !!called++ };
        },
        'return': function () {
          SAFE_CLOSING = true;
        }
      };
      iteratorWithReturn[ITERATOR$4] = function () {
        return this;
      };
      // eslint-disable-next-line no-throw-literal
      Array.from(iteratorWithReturn, function () { throw 2; });
    } catch (error) { /* empty */ }

    var checkCorrectnessOfIteration = function (exec, SKIP_CLOSING) {
      if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
      var ITERATION_SUPPORT = false;
      try {
        var object = {};
        object[ITERATOR$4] = function () {
          return {
            next: function () {
              return { done: ITERATION_SUPPORT = true };
            }
          };
        };
        exec(object);
      } catch (error) { /* empty */ }
      return ITERATION_SUPPORT;
    };

    var SPECIES$4 = wellKnownSymbol('species');

    // `SpeciesConstructor` abstract operation
    // https://tc39.github.io/ecma262/#sec-speciesconstructor
    var speciesConstructor = function (O, defaultConstructor) {
      var C = anObject(O).constructor;
      var S;
      return C === undefined || (S = anObject(C)[SPECIES$4]) == undefined ? defaultConstructor : aFunction$1(S);
    };

    var engineIsIos = /(iphone|ipod|ipad).*applewebkit/i.test(engineUserAgent);

    var location$1 = global_1.location;
    var set$1 = global_1.setImmediate;
    var clear = global_1.clearImmediate;
    var process$1 = global_1.process;
    var MessageChannel = global_1.MessageChannel;
    var Dispatch = global_1.Dispatch;
    var counter = 0;
    var queue = {};
    var ONREADYSTATECHANGE = 'onreadystatechange';
    var defer, channel, port;

    var run$1 = function (id) {
      // eslint-disable-next-line no-prototype-builtins
      if (queue.hasOwnProperty(id)) {
        var fn = queue[id];
        delete queue[id];
        fn();
      }
    };

    var runner = function (id) {
      return function () {
        run$1(id);
      };
    };

    var listener = function (event) {
      run$1(event.data);
    };

    var post = function (id) {
      // old engines have not location.origin
      global_1.postMessage(id + '', location$1.protocol + '//' + location$1.host);
    };

    // Node.js 0.9+ & IE10+ has setImmediate, otherwise:
    if (!set$1 || !clear) {
      set$1 = function setImmediate(fn) {
        var args = [];
        var i = 1;
        while (arguments.length > i) args.push(arguments[i++]);
        queue[++counter] = function () {
          // eslint-disable-next-line no-new-func
          (typeof fn == 'function' ? fn : Function(fn)).apply(undefined, args);
        };
        defer(counter);
        return counter;
      };
      clear = function clearImmediate(id) {
        delete queue[id];
      };
      // Node.js 0.8-
      if (classofRaw(process$1) == 'process') {
        defer = function (id) {
          process$1.nextTick(runner(id));
        };
      // Sphere (JS game engine) Dispatch API
      } else if (Dispatch && Dispatch.now) {
        defer = function (id) {
          Dispatch.now(runner(id));
        };
      // Browsers with MessageChannel, includes WebWorkers
      // except iOS - https://github.com/zloirock/core-js/issues/624
      } else if (MessageChannel && !engineIsIos) {
        channel = new MessageChannel();
        port = channel.port2;
        channel.port1.onmessage = listener;
        defer = functionBindContext(port.postMessage, port, 1);
      // Browsers with postMessage, skip WebWorkers
      // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
      } else if (
        global_1.addEventListener &&
        typeof postMessage == 'function' &&
        !global_1.importScripts &&
        !fails(post) &&
        location$1.protocol !== 'file:'
      ) {
        defer = post;
        global_1.addEventListener('message', listener, false);
      // IE8-
      } else if (ONREADYSTATECHANGE in documentCreateElement('script')) {
        defer = function (id) {
          html.appendChild(documentCreateElement('script'))[ONREADYSTATECHANGE] = function () {
            html.removeChild(this);
            run$1(id);
          };
        };
      // Rest old browsers
      } else {
        defer = function (id) {
          setTimeout(runner(id), 0);
        };
      }
    }

    var task = {
      set: set$1,
      clear: clear
    };

    var getOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;

    var macrotask = task.set;


    var MutationObserver = global_1.MutationObserver || global_1.WebKitMutationObserver;
    var process$2 = global_1.process;
    var Promise$1 = global_1.Promise;
    var IS_NODE = classofRaw(process$2) == 'process';
    // Node.js 11 shows ExperimentalWarning on getting `queueMicrotask`
    var queueMicrotaskDescriptor = getOwnPropertyDescriptor$2(global_1, 'queueMicrotask');
    var queueMicrotask = queueMicrotaskDescriptor && queueMicrotaskDescriptor.value;

    var flush$1, head, last, notify, toggle, node, promise$1, then;

    // modern engines have queueMicrotask method
    if (!queueMicrotask) {
      flush$1 = function () {
        var parent, fn;
        if (IS_NODE && (parent = process$2.domain)) parent.exit();
        while (head) {
          fn = head.fn;
          head = head.next;
          try {
            fn();
          } catch (error) {
            if (head) notify();
            else last = undefined;
            throw error;
          }
        } last = undefined;
        if (parent) parent.enter();
      };

      // Node.js
      if (IS_NODE) {
        notify = function () {
          process$2.nextTick(flush$1);
        };
      // browsers with MutationObserver, except iOS - https://github.com/zloirock/core-js/issues/339
      } else if (MutationObserver && !engineIsIos) {
        toggle = true;
        node = document.createTextNode('');
        new MutationObserver(flush$1).observe(node, { characterData: true });
        notify = function () {
          node.data = toggle = !toggle;
        };
      // environments with maybe non-completely correct, but existent Promise
      } else if (Promise$1 && Promise$1.resolve) {
        // Promise.resolve without an argument throws an error in LG WebOS 2
        promise$1 = Promise$1.resolve(undefined);
        then = promise$1.then;
        notify = function () {
          then.call(promise$1, flush$1);
        };
      // for other environments - macrotask based on:
      // - setImmediate
      // - MessageChannel
      // - window.postMessag
      // - onreadystatechange
      // - setTimeout
      } else {
        notify = function () {
          // strange IE + webpack dev server bug - use .call(global)
          macrotask.call(global_1, flush$1);
        };
      }
    }

    var microtask = queueMicrotask || function (fn) {
      var task = { fn: fn, next: undefined };
      if (last) last.next = task;
      if (!head) {
        head = task;
        notify();
      } last = task;
    };

    var PromiseCapability = function (C) {
      var resolve, reject;
      this.promise = new C(function ($$resolve, $$reject) {
        if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
        resolve = $$resolve;
        reject = $$reject;
      });
      this.resolve = aFunction$1(resolve);
      this.reject = aFunction$1(reject);
    };

    // 25.4.1.5 NewPromiseCapability(C)
    var f$5 = function (C) {
      return new PromiseCapability(C);
    };

    var newPromiseCapability = {
    	f: f$5
    };

    var promiseResolve = function (C, x) {
      anObject(C);
      if (isObject(x) && x.constructor === C) return x;
      var promiseCapability = newPromiseCapability.f(C);
      var resolve = promiseCapability.resolve;
      resolve(x);
      return promiseCapability.promise;
    };

    var hostReportErrors = function (a, b) {
      var console = global_1.console;
      if (console && console.error) {
        arguments.length === 1 ? console.error(a) : console.error(a, b);
      }
    };

    var perform = function (exec) {
      try {
        return { error: false, value: exec() };
      } catch (error) {
        return { error: true, value: error };
      }
    };

    var task$1 = task.set;










    var SPECIES$5 = wellKnownSymbol('species');
    var PROMISE = 'Promise';
    var getInternalState$1 = internalState.get;
    var setInternalState$1 = internalState.set;
    var getInternalPromiseState = internalState.getterFor(PROMISE);
    var PromiseConstructor = nativePromiseConstructor;
    var TypeError$1 = global_1.TypeError;
    var document$2 = global_1.document;
    var process$3 = global_1.process;
    var $fetch = getBuiltIn('fetch');
    var newPromiseCapability$1 = newPromiseCapability.f;
    var newGenericPromiseCapability = newPromiseCapability$1;
    var IS_NODE$1 = classofRaw(process$3) == 'process';
    var DISPATCH_EVENT = !!(document$2 && document$2.createEvent && global_1.dispatchEvent);
    var UNHANDLED_REJECTION = 'unhandledrejection';
    var REJECTION_HANDLED = 'rejectionhandled';
    var PENDING = 0;
    var FULFILLED = 1;
    var REJECTED = 2;
    var HANDLED = 1;
    var UNHANDLED = 2;
    var Internal, OwnPromiseCapability, PromiseWrapper, nativeThen;

    var FORCED$2 = isForced_1(PROMISE, function () {
      var GLOBAL_CORE_JS_PROMISE = inspectSource(PromiseConstructor) !== String(PromiseConstructor);
      if (!GLOBAL_CORE_JS_PROMISE) {
        // V8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
        // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
        // We can't detect it synchronously, so just check versions
        if (engineV8Version === 66) return true;
        // Unhandled rejections tracking support, NodeJS Promise without it fails @@species test
        if (!IS_NODE$1 && typeof PromiseRejectionEvent != 'function') return true;
      }
      // We can't use @@species feature detection in V8 since it causes
      // deoptimization and performance degradation
      // https://github.com/zloirock/core-js/issues/679
      if (engineV8Version >= 51 && /native code/.test(PromiseConstructor)) return false;
      // Detect correctness of subclassing with @@species support
      var promise = PromiseConstructor.resolve(1);
      var FakePromise = function (exec) {
        exec(function () { /* empty */ }, function () { /* empty */ });
      };
      var constructor = promise.constructor = {};
      constructor[SPECIES$5] = FakePromise;
      return !(promise.then(function () { /* empty */ }) instanceof FakePromise);
    });

    var INCORRECT_ITERATION = FORCED$2 || !checkCorrectnessOfIteration(function (iterable) {
      PromiseConstructor.all(iterable)['catch'](function () { /* empty */ });
    });

    // helpers
    var isThenable = function (it) {
      var then;
      return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
    };

    var notify$1 = function (promise, state, isReject) {
      if (state.notified) return;
      state.notified = true;
      var chain = state.reactions;
      microtask(function () {
        var value = state.value;
        var ok = state.state == FULFILLED;
        var index = 0;
        // variable length - can't use forEach
        while (chain.length > index) {
          var reaction = chain[index++];
          var handler = ok ? reaction.ok : reaction.fail;
          var resolve = reaction.resolve;
          var reject = reaction.reject;
          var domain = reaction.domain;
          var result, then, exited;
          try {
            if (handler) {
              if (!ok) {
                if (state.rejection === UNHANDLED) onHandleUnhandled(promise, state);
                state.rejection = HANDLED;
              }
              if (handler === true) result = value;
              else {
                if (domain) domain.enter();
                result = handler(value); // can throw
                if (domain) {
                  domain.exit();
                  exited = true;
                }
              }
              if (result === reaction.promise) {
                reject(TypeError$1('Promise-chain cycle'));
              } else if (then = isThenable(result)) {
                then.call(result, resolve, reject);
              } else resolve(result);
            } else reject(value);
          } catch (error) {
            if (domain && !exited) domain.exit();
            reject(error);
          }
        }
        state.reactions = [];
        state.notified = false;
        if (isReject && !state.rejection) onUnhandled(promise, state);
      });
    };

    var dispatchEvent = function (name, promise, reason) {
      var event, handler;
      if (DISPATCH_EVENT) {
        event = document$2.createEvent('Event');
        event.promise = promise;
        event.reason = reason;
        event.initEvent(name, false, true);
        global_1.dispatchEvent(event);
      } else event = { promise: promise, reason: reason };
      if (handler = global_1['on' + name]) handler(event);
      else if (name === UNHANDLED_REJECTION) hostReportErrors('Unhandled promise rejection', reason);
    };

    var onUnhandled = function (promise, state) {
      task$1.call(global_1, function () {
        var value = state.value;
        var IS_UNHANDLED = isUnhandled(state);
        var result;
        if (IS_UNHANDLED) {
          result = perform(function () {
            if (IS_NODE$1) {
              process$3.emit('unhandledRejection', value, promise);
            } else dispatchEvent(UNHANDLED_REJECTION, promise, value);
          });
          // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
          state.rejection = IS_NODE$1 || isUnhandled(state) ? UNHANDLED : HANDLED;
          if (result.error) throw result.value;
        }
      });
    };

    var isUnhandled = function (state) {
      return state.rejection !== HANDLED && !state.parent;
    };

    var onHandleUnhandled = function (promise, state) {
      task$1.call(global_1, function () {
        if (IS_NODE$1) {
          process$3.emit('rejectionHandled', promise);
        } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
      });
    };

    var bind = function (fn, promise, state, unwrap) {
      return function (value) {
        fn(promise, state, value, unwrap);
      };
    };

    var internalReject = function (promise, state, value, unwrap) {
      if (state.done) return;
      state.done = true;
      if (unwrap) state = unwrap;
      state.value = value;
      state.state = REJECTED;
      notify$1(promise, state, true);
    };

    var internalResolve = function (promise, state, value, unwrap) {
      if (state.done) return;
      state.done = true;
      if (unwrap) state = unwrap;
      try {
        if (promise === value) throw TypeError$1("Promise can't be resolved itself");
        var then = isThenable(value);
        if (then) {
          microtask(function () {
            var wrapper = { done: false };
            try {
              then.call(value,
                bind(internalResolve, promise, wrapper, state),
                bind(internalReject, promise, wrapper, state)
              );
            } catch (error) {
              internalReject(promise, wrapper, error, state);
            }
          });
        } else {
          state.value = value;
          state.state = FULFILLED;
          notify$1(promise, state, false);
        }
      } catch (error) {
        internalReject(promise, { done: false }, error, state);
      }
    };

    // constructor polyfill
    if (FORCED$2) {
      // 25.4.3.1 Promise(executor)
      PromiseConstructor = function Promise(executor) {
        anInstance(this, PromiseConstructor, PROMISE);
        aFunction$1(executor);
        Internal.call(this);
        var state = getInternalState$1(this);
        try {
          executor(bind(internalResolve, this, state), bind(internalReject, this, state));
        } catch (error) {
          internalReject(this, state, error);
        }
      };
      // eslint-disable-next-line no-unused-vars
      Internal = function Promise(executor) {
        setInternalState$1(this, {
          type: PROMISE,
          done: false,
          notified: false,
          parent: false,
          reactions: [],
          rejection: false,
          state: PENDING,
          value: undefined
        });
      };
      Internal.prototype = redefineAll(PromiseConstructor.prototype, {
        // `Promise.prototype.then` method
        // https://tc39.github.io/ecma262/#sec-promise.prototype.then
        then: function then(onFulfilled, onRejected) {
          var state = getInternalPromiseState(this);
          var reaction = newPromiseCapability$1(speciesConstructor(this, PromiseConstructor));
          reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
          reaction.fail = typeof onRejected == 'function' && onRejected;
          reaction.domain = IS_NODE$1 ? process$3.domain : undefined;
          state.parent = true;
          state.reactions.push(reaction);
          if (state.state != PENDING) notify$1(this, state, false);
          return reaction.promise;
        },
        // `Promise.prototype.catch` method
        // https://tc39.github.io/ecma262/#sec-promise.prototype.catch
        'catch': function (onRejected) {
          return this.then(undefined, onRejected);
        }
      });
      OwnPromiseCapability = function () {
        var promise = new Internal();
        var state = getInternalState$1(promise);
        this.promise = promise;
        this.resolve = bind(internalResolve, promise, state);
        this.reject = bind(internalReject, promise, state);
      };
      newPromiseCapability.f = newPromiseCapability$1 = function (C) {
        return C === PromiseConstructor || C === PromiseWrapper
          ? new OwnPromiseCapability(C)
          : newGenericPromiseCapability(C);
      };

      if ( typeof nativePromiseConstructor == 'function') {
        nativeThen = nativePromiseConstructor.prototype.then;

        // wrap native Promise#then for native async functions
        redefine(nativePromiseConstructor.prototype, 'then', function then(onFulfilled, onRejected) {
          var that = this;
          return new PromiseConstructor(function (resolve, reject) {
            nativeThen.call(that, resolve, reject);
          }).then(onFulfilled, onRejected);
        // https://github.com/zloirock/core-js/issues/640
        }, { unsafe: true });

        // wrap fetch result
        if (typeof $fetch == 'function') _export({ global: true, enumerable: true, forced: true }, {
          // eslint-disable-next-line no-unused-vars
          fetch: function fetch(input /* , init */) {
            return promiseResolve(PromiseConstructor, $fetch.apply(global_1, arguments));
          }
        });
      }
    }

    _export({ global: true, wrap: true, forced: FORCED$2 }, {
      Promise: PromiseConstructor
    });

    setToStringTag(PromiseConstructor, PROMISE, false);
    setSpecies(PROMISE);

    PromiseWrapper = getBuiltIn(PROMISE);

    // statics
    _export({ target: PROMISE, stat: true, forced: FORCED$2 }, {
      // `Promise.reject` method
      // https://tc39.github.io/ecma262/#sec-promise.reject
      reject: function reject(r) {
        var capability = newPromiseCapability$1(this);
        capability.reject.call(undefined, r);
        return capability.promise;
      }
    });

    _export({ target: PROMISE, stat: true, forced:  FORCED$2 }, {
      // `Promise.resolve` method
      // https://tc39.github.io/ecma262/#sec-promise.resolve
      resolve: function resolve(x) {
        return promiseResolve( this, x);
      }
    });

    _export({ target: PROMISE, stat: true, forced: INCORRECT_ITERATION }, {
      // `Promise.all` method
      // https://tc39.github.io/ecma262/#sec-promise.all
      all: function all(iterable) {
        var C = this;
        var capability = newPromiseCapability$1(C);
        var resolve = capability.resolve;
        var reject = capability.reject;
        var result = perform(function () {
          var $promiseResolve = aFunction$1(C.resolve);
          var values = [];
          var counter = 0;
          var remaining = 1;
          iterate_1(iterable, function (promise) {
            var index = counter++;
            var alreadyCalled = false;
            values.push(undefined);
            remaining++;
            $promiseResolve.call(C, promise).then(function (value) {
              if (alreadyCalled) return;
              alreadyCalled = true;
              values[index] = value;
              --remaining || resolve(values);
            }, reject);
          });
          --remaining || resolve(values);
        });
        if (result.error) reject(result.value);
        return capability.promise;
      },
      // `Promise.race` method
      // https://tc39.github.io/ecma262/#sec-promise.race
      race: function race(iterable) {
        var C = this;
        var capability = newPromiseCapability$1(C);
        var reject = capability.reject;
        var result = perform(function () {
          var $promiseResolve = aFunction$1(C.resolve);
          iterate_1(iterable, function (promise) {
            $promiseResolve.call(C, promise).then(capability.resolve, reject);
          });
        });
        if (result.error) reject(result.value);
        return capability.promise;
      }
    });

    // Safari bug https://bugs.webkit.org/show_bug.cgi?id=200829
    var NON_GENERIC = !!nativePromiseConstructor && fails(function () {
      nativePromiseConstructor.prototype['finally'].call({ then: function () { /* empty */ } }, function () { /* empty */ });
    });

    // `Promise.prototype.finally` method
    // https://tc39.github.io/ecma262/#sec-promise.prototype.finally
    _export({ target: 'Promise', proto: true, real: true, forced: NON_GENERIC }, {
      'finally': function (onFinally) {
        var C = speciesConstructor(this, getBuiltIn('Promise'));
        var isFunction = typeof onFinally == 'function';
        return this.then(
          isFunction ? function (x) {
            return promiseResolve(C, onFinally()).then(function () { return x; });
          } : onFinally,
          isFunction ? function (e) {
            return promiseResolve(C, onFinally()).then(function () { throw e; });
          } : onFinally
        );
      }
    });

    // patch native Promise.prototype for native async functions
    if ( typeof nativePromiseConstructor == 'function' && !nativePromiseConstructor.prototype['finally']) {
      redefine(nativePromiseConstructor.prototype, 'finally', getBuiltIn('Promise').prototype['finally']);
    }

    // `RegExp.prototype.flags` getter implementation
    // https://tc39.github.io/ecma262/#sec-get-regexp.prototype.flags
    var regexpFlags = function () {
      var that = anObject(this);
      var result = '';
      if (that.global) result += 'g';
      if (that.ignoreCase) result += 'i';
      if (that.multiline) result += 'm';
      if (that.dotAll) result += 's';
      if (that.unicode) result += 'u';
      if (that.sticky) result += 'y';
      return result;
    };

    // babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError,
    // so we use an intermediate function.
    function RE(s, f) {
      return RegExp(s, f);
    }

    var UNSUPPORTED_Y = fails(function () {
      // babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
      var re = RE('a', 'y');
      re.lastIndex = 2;
      return re.exec('abcd') != null;
    });

    var BROKEN_CARET = fails(function () {
      // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
      var re = RE('^r', 'gy');
      re.lastIndex = 2;
      return re.exec('str') != null;
    });

    var regexpStickyHelpers = {
    	UNSUPPORTED_Y: UNSUPPORTED_Y,
    	BROKEN_CARET: BROKEN_CARET
    };

    var nativeExec = RegExp.prototype.exec;
    // This always refers to the native implementation, because the
    // String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
    // which loads this file before patching the method.
    var nativeReplace = String.prototype.replace;

    var patchedExec = nativeExec;

    var UPDATES_LAST_INDEX_WRONG = (function () {
      var re1 = /a/;
      var re2 = /b*/g;
      nativeExec.call(re1, 'a');
      nativeExec.call(re2, 'a');
      return re1.lastIndex !== 0 || re2.lastIndex !== 0;
    })();

    var UNSUPPORTED_Y$1 = regexpStickyHelpers.UNSUPPORTED_Y || regexpStickyHelpers.BROKEN_CARET;

    // nonparticipating capturing group, copied from es5-shim's String#split patch.
    var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

    var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y$1;

    if (PATCH) {
      patchedExec = function exec(str) {
        var re = this;
        var lastIndex, reCopy, match, i;
        var sticky = UNSUPPORTED_Y$1 && re.sticky;
        var flags = regexpFlags.call(re);
        var source = re.source;
        var charsAdded = 0;
        var strCopy = str;

        if (sticky) {
          flags = flags.replace('y', '');
          if (flags.indexOf('g') === -1) {
            flags += 'g';
          }

          strCopy = String(str).slice(re.lastIndex);
          // Support anchored sticky behavior.
          if (re.lastIndex > 0 && (!re.multiline || re.multiline && str[re.lastIndex - 1] !== '\n')) {
            source = '(?: ' + source + ')';
            strCopy = ' ' + strCopy;
            charsAdded++;
          }
          // ^(? + rx + ) is needed, in combination with some str slicing, to
          // simulate the 'y' flag.
          reCopy = new RegExp('^(?:' + source + ')', flags);
        }

        if (NPCG_INCLUDED) {
          reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
        }
        if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;

        match = nativeExec.call(sticky ? reCopy : re, strCopy);

        if (sticky) {
          if (match) {
            match.input = match.input.slice(charsAdded);
            match[0] = match[0].slice(charsAdded);
            match.index = re.lastIndex;
            re.lastIndex += match[0].length;
          } else re.lastIndex = 0;
        } else if (UPDATES_LAST_INDEX_WRONG && match) {
          re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
        }
        if (NPCG_INCLUDED && match && match.length > 1) {
          // Fix browsers whose `exec` methods don't consistently return `undefined`
          // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
          nativeReplace.call(match[0], reCopy, function () {
            for (i = 1; i < arguments.length - 2; i++) {
              if (arguments[i] === undefined) match[i] = undefined;
            }
          });
        }

        return match;
      };
    }

    var regexpExec = patchedExec;

    _export({ target: 'RegExp', proto: true, forced: /./.exec !== regexpExec }, {
      exec: regexpExec
    });

    var TO_STRING$1 = 'toString';
    var RegExpPrototype = RegExp.prototype;
    var nativeToString = RegExpPrototype[TO_STRING$1];

    var NOT_GENERIC = fails(function () { return nativeToString.call({ source: 'a', flags: 'b' }) != '/a/b'; });
    // FF44- RegExp#toString has a wrong name
    var INCORRECT_NAME = nativeToString.name != TO_STRING$1;

    // `RegExp.prototype.toString` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype.tostring
    if (NOT_GENERIC || INCORRECT_NAME) {
      redefine(RegExp.prototype, TO_STRING$1, function toString() {
        var R = anObject(this);
        var p = String(R.source);
        var rf = R.flags;
        var f = String(rf === undefined && R instanceof RegExp && !('flags' in RegExpPrototype) ? regexpFlags.call(R) : rf);
        return '/' + p + '/' + f;
      }, { unsafe: true });
    }

    // `String.prototype.{ codePointAt, at }` methods implementation
    var createMethod$5 = function (CONVERT_TO_STRING) {
      return function ($this, pos) {
        var S = String(requireObjectCoercible($this));
        var position = toInteger(pos);
        var size = S.length;
        var first, second;
        if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
        first = S.charCodeAt(position);
        return first < 0xD800 || first > 0xDBFF || position + 1 === size
          || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF
            ? CONVERT_TO_STRING ? S.charAt(position) : first
            : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
      };
    };

    var stringMultibyte = {
      // `String.prototype.codePointAt` method
      // https://tc39.github.io/ecma262/#sec-string.prototype.codepointat
      codeAt: createMethod$5(false),
      // `String.prototype.at` method
      // https://github.com/mathiasbynens/String.prototype.at
      charAt: createMethod$5(true)
    };

    var charAt = stringMultibyte.charAt;



    var STRING_ITERATOR = 'String Iterator';
    var setInternalState$2 = internalState.set;
    var getInternalState$2 = internalState.getterFor(STRING_ITERATOR);

    // `String.prototype[@@iterator]` method
    // https://tc39.github.io/ecma262/#sec-string.prototype-@@iterator
    defineIterator(String, 'String', function (iterated) {
      setInternalState$2(this, {
        type: STRING_ITERATOR,
        string: String(iterated),
        index: 0
      });
    // `%StringIteratorPrototype%.next` method
    // https://tc39.github.io/ecma262/#sec-%stringiteratorprototype%.next
    }, function next() {
      var state = getInternalState$2(this);
      var string = state.string;
      var index = state.index;
      var point;
      if (index >= string.length) return { value: undefined, done: true };
      point = charAt(string, index);
      state.index += point.length;
      return { value: point, done: false };
    });

    // TODO: Remove from `core-js@4` since it's moved to entry points







    var SPECIES$6 = wellKnownSymbol('species');

    var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
      // #replace needs built-in support for named groups.
      // #match works fine because it just return the exec results, even if it has
      // a "grops" property.
      var re = /./;
      re.exec = function () {
        var result = [];
        result.groups = { a: '7' };
        return result;
      };
      return ''.replace(re, '$<a>') !== '7';
    });

    // IE <= 11 replaces $0 with the whole match, as if it was $&
    // https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0
    var REPLACE_KEEPS_$0 = (function () {
      return 'a'.replace(/./, '$0') === '$0';
    })();

    var REPLACE = wellKnownSymbol('replace');
    // Safari <= 13.0.3(?) substitutes nth capture where n>m with an empty string
    var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = (function () {
      if (/./[REPLACE]) {
        return /./[REPLACE]('a', '$0') === '';
      }
      return false;
    })();

    // Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
    // Weex JS has frozen built-in prototypes, so use try / catch wrapper
    var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function () {
      var re = /(?:)/;
      var originalExec = re.exec;
      re.exec = function () { return originalExec.apply(this, arguments); };
      var result = 'ab'.split(re);
      return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
    });

    var fixRegexpWellKnownSymbolLogic = function (KEY, length, exec, sham) {
      var SYMBOL = wellKnownSymbol(KEY);

      var DELEGATES_TO_SYMBOL = !fails(function () {
        // String methods call symbol-named RegEp methods
        var O = {};
        O[SYMBOL] = function () { return 7; };
        return ''[KEY](O) != 7;
      });

      var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
        // Symbol-named RegExp methods call .exec
        var execCalled = false;
        var re = /a/;

        if (KEY === 'split') {
          // We can't use real regex here since it causes deoptimization
          // and serious performance degradation in V8
          // https://github.com/zloirock/core-js/issues/306
          re = {};
          // RegExp[@@split] doesn't call the regex's exec method, but first creates
          // a new one. We need to return the patched regex when creating the new one.
          re.constructor = {};
          re.constructor[SPECIES$6] = function () { return re; };
          re.flags = '';
          re[SYMBOL] = /./[SYMBOL];
        }

        re.exec = function () { execCalled = true; return null; };

        re[SYMBOL]('');
        return !execCalled;
      });

      if (
        !DELEGATES_TO_SYMBOL ||
        !DELEGATES_TO_EXEC ||
        (KEY === 'replace' && !(
          REPLACE_SUPPORTS_NAMED_GROUPS &&
          REPLACE_KEEPS_$0 &&
          !REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE
        )) ||
        (KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
      ) {
        var nativeRegExpMethod = /./[SYMBOL];
        var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
          if (regexp.exec === regexpExec) {
            if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
              // The native String method already delegates to @@method (this
              // polyfilled function), leasing to infinite recursion.
              // We avoid it by directly calling the native @@method method.
              return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
            }
            return { done: true, value: nativeMethod.call(str, regexp, arg2) };
          }
          return { done: false };
        }, {
          REPLACE_KEEPS_$0: REPLACE_KEEPS_$0,
          REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE: REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE
        });
        var stringMethod = methods[0];
        var regexMethod = methods[1];

        redefine(String.prototype, KEY, stringMethod);
        redefine(RegExp.prototype, SYMBOL, length == 2
          // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
          // 21.2.5.11 RegExp.prototype[@@split](string, limit)
          ? function (string, arg) { return regexMethod.call(string, this, arg); }
          // 21.2.5.6 RegExp.prototype[@@match](string)
          // 21.2.5.9 RegExp.prototype[@@search](string)
          : function (string) { return regexMethod.call(string, this); }
        );
      }

      if (sham) createNonEnumerableProperty(RegExp.prototype[SYMBOL], 'sham', true);
    };

    var MATCH = wellKnownSymbol('match');

    // `IsRegExp` abstract operation
    // https://tc39.github.io/ecma262/#sec-isregexp
    var isRegexp = function (it) {
      var isRegExp;
      return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : classofRaw(it) == 'RegExp');
    };

    var charAt$1 = stringMultibyte.charAt;

    // `AdvanceStringIndex` abstract operation
    // https://tc39.github.io/ecma262/#sec-advancestringindex
    var advanceStringIndex = function (S, index, unicode) {
      return index + (unicode ? charAt$1(S, index).length : 1);
    };

    // `RegExpExec` abstract operation
    // https://tc39.github.io/ecma262/#sec-regexpexec
    var regexpExecAbstract = function (R, S) {
      var exec = R.exec;
      if (typeof exec === 'function') {
        var result = exec.call(R, S);
        if (typeof result !== 'object') {
          throw TypeError('RegExp exec method returned something other than an Object or null');
        }
        return result;
      }

      if (classofRaw(R) !== 'RegExp') {
        throw TypeError('RegExp#exec called on incompatible receiver');
      }

      return regexpExec.call(R, S);
    };

    var arrayPush = [].push;
    var min$2 = Math.min;
    var MAX_UINT32 = 0xFFFFFFFF;

    // babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError
    var SUPPORTS_Y = !fails(function () { return !RegExp(MAX_UINT32, 'y'); });

    // @@split logic
    fixRegexpWellKnownSymbolLogic('split', 2, function (SPLIT, nativeSplit, maybeCallNative) {
      var internalSplit;
      if (
        'abbc'.split(/(b)*/)[1] == 'c' ||
        'test'.split(/(?:)/, -1).length != 4 ||
        'ab'.split(/(?:ab)*/).length != 2 ||
        '.'.split(/(.?)(.?)/).length != 4 ||
        '.'.split(/()()/).length > 1 ||
        ''.split(/.?/).length
      ) {
        // based on es5-shim implementation, need to rework it
        internalSplit = function (separator, limit) {
          var string = String(requireObjectCoercible(this));
          var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
          if (lim === 0) return [];
          if (separator === undefined) return [string];
          // If `separator` is not a regex, use native split
          if (!isRegexp(separator)) {
            return nativeSplit.call(string, separator, lim);
          }
          var output = [];
          var flags = (separator.ignoreCase ? 'i' : '') +
                      (separator.multiline ? 'm' : '') +
                      (separator.unicode ? 'u' : '') +
                      (separator.sticky ? 'y' : '');
          var lastLastIndex = 0;
          // Make `global` and avoid `lastIndex` issues by working with a copy
          var separatorCopy = new RegExp(separator.source, flags + 'g');
          var match, lastIndex, lastLength;
          while (match = regexpExec.call(separatorCopy, string)) {
            lastIndex = separatorCopy.lastIndex;
            if (lastIndex > lastLastIndex) {
              output.push(string.slice(lastLastIndex, match.index));
              if (match.length > 1 && match.index < string.length) arrayPush.apply(output, match.slice(1));
              lastLength = match[0].length;
              lastLastIndex = lastIndex;
              if (output.length >= lim) break;
            }
            if (separatorCopy.lastIndex === match.index) separatorCopy.lastIndex++; // Avoid an infinite loop
          }
          if (lastLastIndex === string.length) {
            if (lastLength || !separatorCopy.test('')) output.push('');
          } else output.push(string.slice(lastLastIndex));
          return output.length > lim ? output.slice(0, lim) : output;
        };
      // Chakra, V8
      } else if ('0'.split(undefined, 0).length) {
        internalSplit = function (separator, limit) {
          return separator === undefined && limit === 0 ? [] : nativeSplit.call(this, separator, limit);
        };
      } else internalSplit = nativeSplit;

      return [
        // `String.prototype.split` method
        // https://tc39.github.io/ecma262/#sec-string.prototype.split
        function split(separator, limit) {
          var O = requireObjectCoercible(this);
          var splitter = separator == undefined ? undefined : separator[SPLIT];
          return splitter !== undefined
            ? splitter.call(separator, O, limit)
            : internalSplit.call(String(O), separator, limit);
        },
        // `RegExp.prototype[@@split]` method
        // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
        //
        // NOTE: This cannot be properly polyfilled in engines that don't support
        // the 'y' flag.
        function (regexp, limit) {
          var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== nativeSplit);
          if (res.done) return res.value;

          var rx = anObject(regexp);
          var S = String(this);
          var C = speciesConstructor(rx, RegExp);

          var unicodeMatching = rx.unicode;
          var flags = (rx.ignoreCase ? 'i' : '') +
                      (rx.multiline ? 'm' : '') +
                      (rx.unicode ? 'u' : '') +
                      (SUPPORTS_Y ? 'y' : 'g');

          // ^(? + rx + ) is needed, in combination with some S slicing, to
          // simulate the 'y' flag.
          var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
          var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
          if (lim === 0) return [];
          if (S.length === 0) return regexpExecAbstract(splitter, S) === null ? [S] : [];
          var p = 0;
          var q = 0;
          var A = [];
          while (q < S.length) {
            splitter.lastIndex = SUPPORTS_Y ? q : 0;
            var z = regexpExecAbstract(splitter, SUPPORTS_Y ? S : S.slice(q));
            var e;
            if (
              z === null ||
              (e = min$2(toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p
            ) {
              q = advanceStringIndex(S, q, unicodeMatching);
            } else {
              A.push(S.slice(p, q));
              if (A.length === lim) return A;
              for (var i = 1; i <= z.length - 1; i++) {
                A.push(z[i]);
                if (A.length === lim) return A;
              }
              q = p = e;
            }
          }
          A.push(S.slice(p));
          return A;
        }
      ];
    }, !SUPPORTS_Y);

    var ITERATOR$5 = wellKnownSymbol('iterator');
    var TO_STRING_TAG$3 = wellKnownSymbol('toStringTag');
    var ArrayValues = es_array_iterator.values;

    for (var COLLECTION_NAME$1 in domIterables) {
      var Collection$1 = global_1[COLLECTION_NAME$1];
      var CollectionPrototype$1 = Collection$1 && Collection$1.prototype;
      if (CollectionPrototype$1) {
        // some Chrome versions have non-configurable methods on DOMTokenList
        if (CollectionPrototype$1[ITERATOR$5] !== ArrayValues) try {
          createNonEnumerableProperty(CollectionPrototype$1, ITERATOR$5, ArrayValues);
        } catch (error) {
          CollectionPrototype$1[ITERATOR$5] = ArrayValues;
        }
        if (!CollectionPrototype$1[TO_STRING_TAG$3]) {
          createNonEnumerableProperty(CollectionPrototype$1, TO_STRING_TAG$3, COLLECTION_NAME$1);
        }
        if (domIterables[COLLECTION_NAME$1]) for (var METHOD_NAME in es_array_iterator) {
          // some Chrome versions have non-configurable methods on DOMTokenList
          if (CollectionPrototype$1[METHOD_NAME] !== es_array_iterator[METHOD_NAME]) try {
            createNonEnumerableProperty(CollectionPrototype$1, METHOD_NAME, es_array_iterator[METHOD_NAME]);
          } catch (error) {
            CollectionPrototype$1[METHOD_NAME] = es_array_iterator[METHOD_NAME];
          }
        }
      }
    }

    var runtime_1 = createCommonjsModule(function (module) {
    /**
     * Copyright (c) 2014-present, Facebook, Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     */

    var runtime = (function (exports) {

      var Op = Object.prototype;
      var hasOwn = Op.hasOwnProperty;
      var undefined$1; // More compressible than void 0.
      var $Symbol = typeof Symbol === "function" ? Symbol : {};
      var iteratorSymbol = $Symbol.iterator || "@@iterator";
      var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
      var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

      function wrap(innerFn, outerFn, self, tryLocsList) {
        // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
        var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
        var generator = Object.create(protoGenerator.prototype);
        var context = new Context(tryLocsList || []);

        // The ._invoke method unifies the implementations of the .next,
        // .throw, and .return methods.
        generator._invoke = makeInvokeMethod(innerFn, self, context);

        return generator;
      }
      exports.wrap = wrap;

      // Try/catch helper to minimize deoptimizations. Returns a completion
      // record like context.tryEntries[i].completion. This interface could
      // have been (and was previously) designed to take a closure to be
      // invoked without arguments, but in all the cases we care about we
      // already have an existing method we want to call, so there's no need
      // to create a new function object. We can even get away with assuming
      // the method takes exactly one argument, since that happens to be true
      // in every case, so we don't have to touch the arguments object. The
      // only additional allocation required is the completion record, which
      // has a stable shape and so hopefully should be cheap to allocate.
      function tryCatch(fn, obj, arg) {
        try {
          return { type: "normal", arg: fn.call(obj, arg) };
        } catch (err) {
          return { type: "throw", arg: err };
        }
      }

      var GenStateSuspendedStart = "suspendedStart";
      var GenStateSuspendedYield = "suspendedYield";
      var GenStateExecuting = "executing";
      var GenStateCompleted = "completed";

      // Returning this object from the innerFn has the same effect as
      // breaking out of the dispatch switch statement.
      var ContinueSentinel = {};

      // Dummy constructor functions that we use as the .constructor and
      // .constructor.prototype properties for functions that return Generator
      // objects. For full spec compliance, you may wish to configure your
      // minifier not to mangle the names of these two functions.
      function Generator() {}
      function GeneratorFunction() {}
      function GeneratorFunctionPrototype() {}

      // This is a polyfill for %IteratorPrototype% for environments that
      // don't natively support it.
      var IteratorPrototype = {};
      IteratorPrototype[iteratorSymbol] = function () {
        return this;
      };

      var getProto = Object.getPrototypeOf;
      var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
      if (NativeIteratorPrototype &&
          NativeIteratorPrototype !== Op &&
          hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
        // This environment has a native %IteratorPrototype%; use it instead
        // of the polyfill.
        IteratorPrototype = NativeIteratorPrototype;
      }

      var Gp = GeneratorFunctionPrototype.prototype =
        Generator.prototype = Object.create(IteratorPrototype);
      GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
      GeneratorFunctionPrototype.constructor = GeneratorFunction;
      GeneratorFunctionPrototype[toStringTagSymbol] =
        GeneratorFunction.displayName = "GeneratorFunction";

      // Helper for defining the .next, .throw, and .return methods of the
      // Iterator interface in terms of a single ._invoke method.
      function defineIteratorMethods(prototype) {
        ["next", "throw", "return"].forEach(function(method) {
          prototype[method] = function(arg) {
            return this._invoke(method, arg);
          };
        });
      }

      exports.isGeneratorFunction = function(genFun) {
        var ctor = typeof genFun === "function" && genFun.constructor;
        return ctor
          ? ctor === GeneratorFunction ||
            // For the native GeneratorFunction constructor, the best we can
            // do is to check its .name property.
            (ctor.displayName || ctor.name) === "GeneratorFunction"
          : false;
      };

      exports.mark = function(genFun) {
        if (Object.setPrototypeOf) {
          Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
        } else {
          genFun.__proto__ = GeneratorFunctionPrototype;
          if (!(toStringTagSymbol in genFun)) {
            genFun[toStringTagSymbol] = "GeneratorFunction";
          }
        }
        genFun.prototype = Object.create(Gp);
        return genFun;
      };

      // Within the body of any async function, `await x` is transformed to
      // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
      // `hasOwn.call(value, "__await")` to determine if the yielded value is
      // meant to be awaited.
      exports.awrap = function(arg) {
        return { __await: arg };
      };

      function AsyncIterator(generator, PromiseImpl) {
        function invoke(method, arg, resolve, reject) {
          var record = tryCatch(generator[method], generator, arg);
          if (record.type === "throw") {
            reject(record.arg);
          } else {
            var result = record.arg;
            var value = result.value;
            if (value &&
                typeof value === "object" &&
                hasOwn.call(value, "__await")) {
              return PromiseImpl.resolve(value.__await).then(function(value) {
                invoke("next", value, resolve, reject);
              }, function(err) {
                invoke("throw", err, resolve, reject);
              });
            }

            return PromiseImpl.resolve(value).then(function(unwrapped) {
              // When a yielded Promise is resolved, its final value becomes
              // the .value of the Promise<{value,done}> result for the
              // current iteration.
              result.value = unwrapped;
              resolve(result);
            }, function(error) {
              // If a rejected Promise was yielded, throw the rejection back
              // into the async generator function so it can be handled there.
              return invoke("throw", error, resolve, reject);
            });
          }
        }

        var previousPromise;

        function enqueue(method, arg) {
          function callInvokeWithMethodAndArg() {
            return new PromiseImpl(function(resolve, reject) {
              invoke(method, arg, resolve, reject);
            });
          }

          return previousPromise =
            // If enqueue has been called before, then we want to wait until
            // all previous Promises have been resolved before calling invoke,
            // so that results are always delivered in the correct order. If
            // enqueue has not been called before, then it is important to
            // call invoke immediately, without waiting on a callback to fire,
            // so that the async generator function has the opportunity to do
            // any necessary setup in a predictable way. This predictability
            // is why the Promise constructor synchronously invokes its
            // executor callback, and why async functions synchronously
            // execute code before the first await. Since we implement simple
            // async functions in terms of async generators, it is especially
            // important to get this right, even though it requires care.
            previousPromise ? previousPromise.then(
              callInvokeWithMethodAndArg,
              // Avoid propagating failures to Promises returned by later
              // invocations of the iterator.
              callInvokeWithMethodAndArg
            ) : callInvokeWithMethodAndArg();
        }

        // Define the unified helper method that is used to implement .next,
        // .throw, and .return (see defineIteratorMethods).
        this._invoke = enqueue;
      }

      defineIteratorMethods(AsyncIterator.prototype);
      AsyncIterator.prototype[asyncIteratorSymbol] = function () {
        return this;
      };
      exports.AsyncIterator = AsyncIterator;

      // Note that simple async functions are implemented on top of
      // AsyncIterator objects; they just return a Promise for the value of
      // the final result produced by the iterator.
      exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
        if (PromiseImpl === void 0) PromiseImpl = Promise;

        var iter = new AsyncIterator(
          wrap(innerFn, outerFn, self, tryLocsList),
          PromiseImpl
        );

        return exports.isGeneratorFunction(outerFn)
          ? iter // If outerFn is a generator, return the full iterator.
          : iter.next().then(function(result) {
              return result.done ? result.value : iter.next();
            });
      };

      function makeInvokeMethod(innerFn, self, context) {
        var state = GenStateSuspendedStart;

        return function invoke(method, arg) {
          if (state === GenStateExecuting) {
            throw new Error("Generator is already running");
          }

          if (state === GenStateCompleted) {
            if (method === "throw") {
              throw arg;
            }

            // Be forgiving, per 25.3.3.3.3 of the spec:
            // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
            return doneResult();
          }

          context.method = method;
          context.arg = arg;

          while (true) {
            var delegate = context.delegate;
            if (delegate) {
              var delegateResult = maybeInvokeDelegate(delegate, context);
              if (delegateResult) {
                if (delegateResult === ContinueSentinel) continue;
                return delegateResult;
              }
            }

            if (context.method === "next") {
              // Setting context._sent for legacy support of Babel's
              // function.sent implementation.
              context.sent = context._sent = context.arg;

            } else if (context.method === "throw") {
              if (state === GenStateSuspendedStart) {
                state = GenStateCompleted;
                throw context.arg;
              }

              context.dispatchException(context.arg);

            } else if (context.method === "return") {
              context.abrupt("return", context.arg);
            }

            state = GenStateExecuting;

            var record = tryCatch(innerFn, self, context);
            if (record.type === "normal") {
              // If an exception is thrown from innerFn, we leave state ===
              // GenStateExecuting and loop back for another invocation.
              state = context.done
                ? GenStateCompleted
                : GenStateSuspendedYield;

              if (record.arg === ContinueSentinel) {
                continue;
              }

              return {
                value: record.arg,
                done: context.done
              };

            } else if (record.type === "throw") {
              state = GenStateCompleted;
              // Dispatch the exception by looping back around to the
              // context.dispatchException(context.arg) call above.
              context.method = "throw";
              context.arg = record.arg;
            }
          }
        };
      }

      // Call delegate.iterator[context.method](context.arg) and handle the
      // result, either by returning a { value, done } result from the
      // delegate iterator, or by modifying context.method and context.arg,
      // setting context.delegate to null, and returning the ContinueSentinel.
      function maybeInvokeDelegate(delegate, context) {
        var method = delegate.iterator[context.method];
        if (method === undefined$1) {
          // A .throw or .return when the delegate iterator has no .throw
          // method always terminates the yield* loop.
          context.delegate = null;

          if (context.method === "throw") {
            // Note: ["return"] must be used for ES3 parsing compatibility.
            if (delegate.iterator["return"]) {
              // If the delegate iterator has a return method, give it a
              // chance to clean up.
              context.method = "return";
              context.arg = undefined$1;
              maybeInvokeDelegate(delegate, context);

              if (context.method === "throw") {
                // If maybeInvokeDelegate(context) changed context.method from
                // "return" to "throw", let that override the TypeError below.
                return ContinueSentinel;
              }
            }

            context.method = "throw";
            context.arg = new TypeError(
              "The iterator does not provide a 'throw' method");
          }

          return ContinueSentinel;
        }

        var record = tryCatch(method, delegate.iterator, context.arg);

        if (record.type === "throw") {
          context.method = "throw";
          context.arg = record.arg;
          context.delegate = null;
          return ContinueSentinel;
        }

        var info = record.arg;

        if (! info) {
          context.method = "throw";
          context.arg = new TypeError("iterator result is not an object");
          context.delegate = null;
          return ContinueSentinel;
        }

        if (info.done) {
          // Assign the result of the finished delegate to the temporary
          // variable specified by delegate.resultName (see delegateYield).
          context[delegate.resultName] = info.value;

          // Resume execution at the desired location (see delegateYield).
          context.next = delegate.nextLoc;

          // If context.method was "throw" but the delegate handled the
          // exception, let the outer generator proceed normally. If
          // context.method was "next", forget context.arg since it has been
          // "consumed" by the delegate iterator. If context.method was
          // "return", allow the original .return call to continue in the
          // outer generator.
          if (context.method !== "return") {
            context.method = "next";
            context.arg = undefined$1;
          }

        } else {
          // Re-yield the result returned by the delegate method.
          return info;
        }

        // The delegate iterator is finished, so forget it and continue with
        // the outer generator.
        context.delegate = null;
        return ContinueSentinel;
      }

      // Define Generator.prototype.{next,throw,return} in terms of the
      // unified ._invoke helper method.
      defineIteratorMethods(Gp);

      Gp[toStringTagSymbol] = "Generator";

      // A Generator should always return itself as the iterator object when the
      // @@iterator function is called on it. Some browsers' implementations of the
      // iterator prototype chain incorrectly implement this, causing the Generator
      // object to not be returned from this call. This ensures that doesn't happen.
      // See https://github.com/facebook/regenerator/issues/274 for more details.
      Gp[iteratorSymbol] = function() {
        return this;
      };

      Gp.toString = function() {
        return "[object Generator]";
      };

      function pushTryEntry(locs) {
        var entry = { tryLoc: locs[0] };

        if (1 in locs) {
          entry.catchLoc = locs[1];
        }

        if (2 in locs) {
          entry.finallyLoc = locs[2];
          entry.afterLoc = locs[3];
        }

        this.tryEntries.push(entry);
      }

      function resetTryEntry(entry) {
        var record = entry.completion || {};
        record.type = "normal";
        delete record.arg;
        entry.completion = record;
      }

      function Context(tryLocsList) {
        // The root entry object (effectively a try statement without a catch
        // or a finally block) gives us a place to store values thrown from
        // locations where there is no enclosing try statement.
        this.tryEntries = [{ tryLoc: "root" }];
        tryLocsList.forEach(pushTryEntry, this);
        this.reset(true);
      }

      exports.keys = function(object) {
        var keys = [];
        for (var key in object) {
          keys.push(key);
        }
        keys.reverse();

        // Rather than returning an object with a next method, we keep
        // things simple and return the next function itself.
        return function next() {
          while (keys.length) {
            var key = keys.pop();
            if (key in object) {
              next.value = key;
              next.done = false;
              return next;
            }
          }

          // To avoid creating an additional object, we just hang the .value
          // and .done properties off the next function object itself. This
          // also ensures that the minifier will not anonymize the function.
          next.done = true;
          return next;
        };
      };

      function values(iterable) {
        if (iterable) {
          var iteratorMethod = iterable[iteratorSymbol];
          if (iteratorMethod) {
            return iteratorMethod.call(iterable);
          }

          if (typeof iterable.next === "function") {
            return iterable;
          }

          if (!isNaN(iterable.length)) {
            var i = -1, next = function next() {
              while (++i < iterable.length) {
                if (hasOwn.call(iterable, i)) {
                  next.value = iterable[i];
                  next.done = false;
                  return next;
                }
              }

              next.value = undefined$1;
              next.done = true;

              return next;
            };

            return next.next = next;
          }
        }

        // Return an iterator with no values.
        return { next: doneResult };
      }
      exports.values = values;

      function doneResult() {
        return { value: undefined$1, done: true };
      }

      Context.prototype = {
        constructor: Context,

        reset: function(skipTempReset) {
          this.prev = 0;
          this.next = 0;
          // Resetting context._sent for legacy support of Babel's
          // function.sent implementation.
          this.sent = this._sent = undefined$1;
          this.done = false;
          this.delegate = null;

          this.method = "next";
          this.arg = undefined$1;

          this.tryEntries.forEach(resetTryEntry);

          if (!skipTempReset) {
            for (var name in this) {
              // Not sure about the optimal order of these conditions:
              if (name.charAt(0) === "t" &&
                  hasOwn.call(this, name) &&
                  !isNaN(+name.slice(1))) {
                this[name] = undefined$1;
              }
            }
          }
        },

        stop: function() {
          this.done = true;

          var rootEntry = this.tryEntries[0];
          var rootRecord = rootEntry.completion;
          if (rootRecord.type === "throw") {
            throw rootRecord.arg;
          }

          return this.rval;
        },

        dispatchException: function(exception) {
          if (this.done) {
            throw exception;
          }

          var context = this;
          function handle(loc, caught) {
            record.type = "throw";
            record.arg = exception;
            context.next = loc;

            if (caught) {
              // If the dispatched exception was caught by a catch block,
              // then let that catch block handle the exception normally.
              context.method = "next";
              context.arg = undefined$1;
            }

            return !! caught;
          }

          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            var record = entry.completion;

            if (entry.tryLoc === "root") {
              // Exception thrown outside of any try block that could handle
              // it, so set the completion value of the entire function to
              // throw the exception.
              return handle("end");
            }

            if (entry.tryLoc <= this.prev) {
              var hasCatch = hasOwn.call(entry, "catchLoc");
              var hasFinally = hasOwn.call(entry, "finallyLoc");

              if (hasCatch && hasFinally) {
                if (this.prev < entry.catchLoc) {
                  return handle(entry.catchLoc, true);
                } else if (this.prev < entry.finallyLoc) {
                  return handle(entry.finallyLoc);
                }

              } else if (hasCatch) {
                if (this.prev < entry.catchLoc) {
                  return handle(entry.catchLoc, true);
                }

              } else if (hasFinally) {
                if (this.prev < entry.finallyLoc) {
                  return handle(entry.finallyLoc);
                }

              } else {
                throw new Error("try statement without catch or finally");
              }
            }
          }
        },

        abrupt: function(type, arg) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            if (entry.tryLoc <= this.prev &&
                hasOwn.call(entry, "finallyLoc") &&
                this.prev < entry.finallyLoc) {
              var finallyEntry = entry;
              break;
            }
          }

          if (finallyEntry &&
              (type === "break" ||
               type === "continue") &&
              finallyEntry.tryLoc <= arg &&
              arg <= finallyEntry.finallyLoc) {
            // Ignore the finally entry if control is not jumping to a
            // location outside the try/catch block.
            finallyEntry = null;
          }

          var record = finallyEntry ? finallyEntry.completion : {};
          record.type = type;
          record.arg = arg;

          if (finallyEntry) {
            this.method = "next";
            this.next = finallyEntry.finallyLoc;
            return ContinueSentinel;
          }

          return this.complete(record);
        },

        complete: function(record, afterLoc) {
          if (record.type === "throw") {
            throw record.arg;
          }

          if (record.type === "break" ||
              record.type === "continue") {
            this.next = record.arg;
          } else if (record.type === "return") {
            this.rval = this.arg = record.arg;
            this.method = "return";
            this.next = "end";
          } else if (record.type === "normal" && afterLoc) {
            this.next = afterLoc;
          }

          return ContinueSentinel;
        },

        finish: function(finallyLoc) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            if (entry.finallyLoc === finallyLoc) {
              this.complete(entry.completion, entry.afterLoc);
              resetTryEntry(entry);
              return ContinueSentinel;
            }
          }
        },

        "catch": function(tryLoc) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            if (entry.tryLoc === tryLoc) {
              var record = entry.completion;
              if (record.type === "throw") {
                var thrown = record.arg;
                resetTryEntry(entry);
              }
              return thrown;
            }
          }

          // The context.catch method must only be called with a location
          // argument that corresponds to a known catch block.
          throw new Error("illegal catch attempt");
        },

        delegateYield: function(iterable, resultName, nextLoc) {
          this.delegate = {
            iterator: values(iterable),
            resultName: resultName,
            nextLoc: nextLoc
          };

          if (this.method === "next") {
            // Deliberately forget the last sent value so that we don't
            // accidentally pass it on to the delegate.
            this.arg = undefined$1;
          }

          return ContinueSentinel;
        }
      };

      // Regardless of whether this script is executing as a CommonJS module
      // or not, return the runtime object so that we can declare the variable
      // regeneratorRuntime in the outer scope, which allows this module to be
      // injected easily by `bin/regenerator --include-runtime script.js`.
      return exports;

    }(
      // If this script is executing as a CommonJS module, use module.exports
      // as the regeneratorRuntime namespace. Otherwise create a new empty
      // object. Either way, the resulting object will be used to initialize
      // the regeneratorRuntime variable at the top of this file.
       module.exports 
    ));

    try {
      regeneratorRuntime = runtime;
    } catch (accidentalStrictMode) {
      // This module should not be running in strict mode, so the above
      // assignment should always work unless something is misconfigured. Just
      // in case runtime.js accidentally runs in strict mode, we can escape
      // strict mode using a global Function call. This could conceivably fail
      // if a Content Security Policy forbids using Function, but in that case
      // the proper solution is to fix the accidental strict mode problem. If
      // you've misconfigured your bundler to force strict mode and applied a
      // CSP to forbid Function, and you're not willing to fix either of those
      // problems, please detail your unique predicament in a GitHub issue.
      Function("r", "regeneratorRuntime = r")(runtime);
    }
    });

    var bind$1 = function bind(fn, thisArg) {
      return function wrap() {
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i];
        }
        return fn.apply(thisArg, args);
      };
    };

    /*global toString:true*/

    // utils is a library of generic helper functions non-specific to axios

    var toString$1 = Object.prototype.toString;

    /**
     * Determine if a value is an Array
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Array, otherwise false
     */
    function isArray$1(val) {
      return toString$1.call(val) === '[object Array]';
    }

    /**
     * Determine if a value is undefined
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if the value is undefined, otherwise false
     */
    function isUndefined(val) {
      return typeof val === 'undefined';
    }

    /**
     * Determine if a value is a Buffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Buffer, otherwise false
     */
    function isBuffer(val) {
      return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
        && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
    }

    /**
     * Determine if a value is an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an ArrayBuffer, otherwise false
     */
    function isArrayBuffer(val) {
      return toString$1.call(val) === '[object ArrayBuffer]';
    }

    /**
     * Determine if a value is a FormData
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an FormData, otherwise false
     */
    function isFormData(val) {
      return (typeof FormData !== 'undefined') && (val instanceof FormData);
    }

    /**
     * Determine if a value is a view on an ArrayBuffer
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
     */
    function isArrayBufferView(val) {
      var result;
      if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
        result = ArrayBuffer.isView(val);
      } else {
        result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
      }
      return result;
    }

    /**
     * Determine if a value is a String
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a String, otherwise false
     */
    function isString(val) {
      return typeof val === 'string';
    }

    /**
     * Determine if a value is a Number
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Number, otherwise false
     */
    function isNumber(val) {
      return typeof val === 'number';
    }

    /**
     * Determine if a value is an Object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is an Object, otherwise false
     */
    function isObject$1(val) {
      return val !== null && typeof val === 'object';
    }

    /**
     * Determine if a value is a Date
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Date, otherwise false
     */
    function isDate(val) {
      return toString$1.call(val) === '[object Date]';
    }

    /**
     * Determine if a value is a File
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a File, otherwise false
     */
    function isFile(val) {
      return toString$1.call(val) === '[object File]';
    }

    /**
     * Determine if a value is a Blob
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Blob, otherwise false
     */
    function isBlob(val) {
      return toString$1.call(val) === '[object Blob]';
    }

    /**
     * Determine if a value is a Function
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Function, otherwise false
     */
    function isFunction(val) {
      return toString$1.call(val) === '[object Function]';
    }

    /**
     * Determine if a value is a Stream
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a Stream, otherwise false
     */
    function isStream(val) {
      return isObject$1(val) && isFunction(val.pipe);
    }

    /**
     * Determine if a value is a URLSearchParams object
     *
     * @param {Object} val The value to test
     * @returns {boolean} True if value is a URLSearchParams object, otherwise false
     */
    function isURLSearchParams(val) {
      return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
    }

    /**
     * Trim excess whitespace off the beginning and end of a string
     *
     * @param {String} str The String to trim
     * @returns {String} The String freed of excess whitespace
     */
    function trim$1(str) {
      return str.replace(/^\s*/, '').replace(/\s*$/, '');
    }

    /**
     * Determine if we're running in a standard browser environment
     *
     * This allows axios to run in a web worker, and react-native.
     * Both environments support XMLHttpRequest, but not fully standard globals.
     *
     * web workers:
     *  typeof window -> undefined
     *  typeof document -> undefined
     *
     * react-native:
     *  navigator.product -> 'ReactNative'
     * nativescript
     *  navigator.product -> 'NativeScript' or 'NS'
     */
    function isStandardBrowserEnv() {
      if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                               navigator.product === 'NativeScript' ||
                                               navigator.product === 'NS')) {
        return false;
      }
      return (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined'
      );
    }

    /**
     * Iterate over an Array or an Object invoking a function for each item.
     *
     * If `obj` is an Array callback will be called passing
     * the value, index, and complete array for each item.
     *
     * If 'obj' is an Object callback will be called passing
     * the value, key, and complete object for each property.
     *
     * @param {Object|Array} obj The object to iterate
     * @param {Function} fn The callback to invoke for each item
     */
    function forEach(obj, fn) {
      // Don't bother if no value provided
      if (obj === null || typeof obj === 'undefined') {
        return;
      }

      // Force an array if not already something iterable
      if (typeof obj !== 'object') {
        /*eslint no-param-reassign:0*/
        obj = [obj];
      }

      if (isArray$1(obj)) {
        // Iterate over array values
        for (var i = 0, l = obj.length; i < l; i++) {
          fn.call(null, obj[i], i, obj);
        }
      } else {
        // Iterate over object keys
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            fn.call(null, obj[key], key, obj);
          }
        }
      }
    }

    /**
     * Accepts varargs expecting each argument to be an object, then
     * immutably merges the properties of each object and returns result.
     *
     * When multiple objects contain the same key the later object in
     * the arguments list will take precedence.
     *
     * Example:
     *
     * ```js
     * var result = merge({foo: 123}, {foo: 456});
     * console.log(result.foo); // outputs 456
     * ```
     *
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function merge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (typeof result[key] === 'object' && typeof val === 'object') {
          result[key] = merge(result[key], val);
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Function equal to merge with the difference being that no reference
     * to original objects is kept.
     *
     * @see merge
     * @param {Object} obj1 Object to merge
     * @returns {Object} Result of all merge properties
     */
    function deepMerge(/* obj1, obj2, obj3, ... */) {
      var result = {};
      function assignValue(val, key) {
        if (typeof result[key] === 'object' && typeof val === 'object') {
          result[key] = deepMerge(result[key], val);
        } else if (typeof val === 'object') {
          result[key] = deepMerge({}, val);
        } else {
          result[key] = val;
        }
      }

      for (var i = 0, l = arguments.length; i < l; i++) {
        forEach(arguments[i], assignValue);
      }
      return result;
    }

    /**
     * Extends object a by mutably adding to it the properties of object b.
     *
     * @param {Object} a The object to be extended
     * @param {Object} b The object to copy properties from
     * @param {Object} thisArg The object to bind function to
     * @return {Object} The resulting value of object a
     */
    function extend(a, b, thisArg) {
      forEach(b, function assignValue(val, key) {
        if (thisArg && typeof val === 'function') {
          a[key] = bind$1(val, thisArg);
        } else {
          a[key] = val;
        }
      });
      return a;
    }

    var utils = {
      isArray: isArray$1,
      isArrayBuffer: isArrayBuffer,
      isBuffer: isBuffer,
      isFormData: isFormData,
      isArrayBufferView: isArrayBufferView,
      isString: isString,
      isNumber: isNumber,
      isObject: isObject$1,
      isUndefined: isUndefined,
      isDate: isDate,
      isFile: isFile,
      isBlob: isBlob,
      isFunction: isFunction,
      isStream: isStream,
      isURLSearchParams: isURLSearchParams,
      isStandardBrowserEnv: isStandardBrowserEnv,
      forEach: forEach,
      merge: merge,
      deepMerge: deepMerge,
      extend: extend,
      trim: trim$1
    };

    function encode(val) {
      return encodeURIComponent(val).
        replace(/%40/gi, '@').
        replace(/%3A/gi, ':').
        replace(/%24/g, '$').
        replace(/%2C/gi, ',').
        replace(/%20/g, '+').
        replace(/%5B/gi, '[').
        replace(/%5D/gi, ']');
    }

    /**
     * Build a URL by appending params to the end
     *
     * @param {string} url The base of the url (e.g., http://www.google.com)
     * @param {object} [params] The params to be appended
     * @returns {string} The formatted url
     */
    var buildURL = function buildURL(url, params, paramsSerializer) {
      /*eslint no-param-reassign:0*/
      if (!params) {
        return url;
      }

      var serializedParams;
      if (paramsSerializer) {
        serializedParams = paramsSerializer(params);
      } else if (utils.isURLSearchParams(params)) {
        serializedParams = params.toString();
      } else {
        var parts = [];

        utils.forEach(params, function serialize(val, key) {
          if (val === null || typeof val === 'undefined') {
            return;
          }

          if (utils.isArray(val)) {
            key = key + '[]';
          } else {
            val = [val];
          }

          utils.forEach(val, function parseValue(v) {
            if (utils.isDate(v)) {
              v = v.toISOString();
            } else if (utils.isObject(v)) {
              v = JSON.stringify(v);
            }
            parts.push(encode(key) + '=' + encode(v));
          });
        });

        serializedParams = parts.join('&');
      }

      if (serializedParams) {
        var hashmarkIndex = url.indexOf('#');
        if (hashmarkIndex !== -1) {
          url = url.slice(0, hashmarkIndex);
        }

        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
      }

      return url;
    };

    function InterceptorManager() {
      this.handlers = [];
    }

    /**
     * Add a new interceptor to the stack
     *
     * @param {Function} fulfilled The function to handle `then` for a `Promise`
     * @param {Function} rejected The function to handle `reject` for a `Promise`
     *
     * @return {Number} An ID used to remove interceptor later
     */
    InterceptorManager.prototype.use = function use(fulfilled, rejected) {
      this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected
      });
      return this.handlers.length - 1;
    };

    /**
     * Remove an interceptor from the stack
     *
     * @param {Number} id The ID that was returned by `use`
     */
    InterceptorManager.prototype.eject = function eject(id) {
      if (this.handlers[id]) {
        this.handlers[id] = null;
      }
    };

    /**
     * Iterate over all the registered interceptors
     *
     * This method is particularly useful for skipping over any
     * interceptors that may have become `null` calling `eject`.
     *
     * @param {Function} fn The function to call for each interceptor
     */
    InterceptorManager.prototype.forEach = function forEach(fn) {
      utils.forEach(this.handlers, function forEachHandler(h) {
        if (h !== null) {
          fn(h);
        }
      });
    };

    var InterceptorManager_1 = InterceptorManager;

    /**
     * Transform the data for a request or a response
     *
     * @param {Object|String} data The data to be transformed
     * @param {Array} headers The headers for the request or response
     * @param {Array|Function} fns A single function or Array of functions
     * @returns {*} The resulting transformed data
     */
    var transformData = function transformData(data, headers, fns) {
      /*eslint no-param-reassign:0*/
      utils.forEach(fns, function transform(fn) {
        data = fn(data, headers);
      });

      return data;
    };

    var isCancel = function isCancel(value) {
      return !!(value && value.__CANCEL__);
    };

    var global$1 = (typeof global !== "undefined" ? global :
                typeof self !== "undefined" ? self :
                typeof window !== "undefined" ? window : {});

    // shim for using process in browser
    // based off https://github.com/defunctzombie/node-process/blob/master/browser.js

    function defaultSetTimout() {
        throw new Error('setTimeout has not been defined');
    }
    function defaultClearTimeout () {
        throw new Error('clearTimeout has not been defined');
    }
    var cachedSetTimeout = defaultSetTimout;
    var cachedClearTimeout = defaultClearTimeout;
    if (typeof global$1.setTimeout === 'function') {
        cachedSetTimeout = setTimeout;
    }
    if (typeof global$1.clearTimeout === 'function') {
        cachedClearTimeout = clearTimeout;
    }

    function runTimeout(fun) {
        if (cachedSetTimeout === setTimeout) {
            //normal enviroments in sane situations
            return setTimeout(fun, 0);
        }
        // if setTimeout wasn't available but was latter defined
        if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
            cachedSetTimeout = setTimeout;
            return setTimeout(fun, 0);
        }
        try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedSetTimeout(fun, 0);
        } catch(e){
            try {
                // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                return cachedSetTimeout.call(null, fun, 0);
            } catch(e){
                // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                return cachedSetTimeout.call(this, fun, 0);
            }
        }


    }
    function runClearTimeout(marker) {
        if (cachedClearTimeout === clearTimeout) {
            //normal enviroments in sane situations
            return clearTimeout(marker);
        }
        // if clearTimeout wasn't available but was latter defined
        if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
            cachedClearTimeout = clearTimeout;
            return clearTimeout(marker);
        }
        try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedClearTimeout(marker);
        } catch (e){
            try {
                // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                return cachedClearTimeout.call(null, marker);
            } catch (e){
                // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                return cachedClearTimeout.call(this, marker);
            }
        }



    }
    var queue$1 = [];
    var draining = false;
    var currentQueue;
    var queueIndex = -1;

    function cleanUpNextTick() {
        if (!draining || !currentQueue) {
            return;
        }
        draining = false;
        if (currentQueue.length) {
            queue$1 = currentQueue.concat(queue$1);
        } else {
            queueIndex = -1;
        }
        if (queue$1.length) {
            drainQueue();
        }
    }

    function drainQueue() {
        if (draining) {
            return;
        }
        var timeout = runTimeout(cleanUpNextTick);
        draining = true;

        var len = queue$1.length;
        while(len) {
            currentQueue = queue$1;
            queue$1 = [];
            while (++queueIndex < len) {
                if (currentQueue) {
                    currentQueue[queueIndex].run();
                }
            }
            queueIndex = -1;
            len = queue$1.length;
        }
        currentQueue = null;
        draining = false;
        runClearTimeout(timeout);
    }
    function nextTick(fun) {
        var args = new Array(arguments.length - 1);
        if (arguments.length > 1) {
            for (var i = 1; i < arguments.length; i++) {
                args[i - 1] = arguments[i];
            }
        }
        queue$1.push(new Item(fun, args));
        if (queue$1.length === 1 && !draining) {
            runTimeout(drainQueue);
        }
    }
    // v8 likes predictible objects
    function Item(fun, array) {
        this.fun = fun;
        this.array = array;
    }
    Item.prototype.run = function () {
        this.fun.apply(null, this.array);
    };
    var title = 'browser';
    var platform = 'browser';
    var browser = true;
    var env = {};
    var argv = [];
    var version$1 = ''; // empty string to avoid regexp issues
    var versions$1 = {};
    var release = {};
    var config = {};

    function noop$1() {}

    var on = noop$1;
    var addListener = noop$1;
    var once = noop$1;
    var off = noop$1;
    var removeListener = noop$1;
    var removeAllListeners = noop$1;
    var emit = noop$1;

    function binding(name) {
        throw new Error('process.binding is not supported');
    }

    function cwd () { return '/' }
    function chdir (dir) {
        throw new Error('process.chdir is not supported');
    }function umask() { return 0; }

    // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
    var performance = global$1.performance || {};
    var performanceNow =
      performance.now        ||
      performance.mozNow     ||
      performance.msNow      ||
      performance.oNow       ||
      performance.webkitNow  ||
      function(){ return (new Date()).getTime() };

    // generate timestamp or delta
    // see http://nodejs.org/api/process.html#process_process_hrtime
    function hrtime(previousTimestamp){
      var clocktime = performanceNow.call(performance)*1e-3;
      var seconds = Math.floor(clocktime);
      var nanoseconds = Math.floor((clocktime%1)*1e9);
      if (previousTimestamp) {
        seconds = seconds - previousTimestamp[0];
        nanoseconds = nanoseconds - previousTimestamp[1];
        if (nanoseconds<0) {
          seconds--;
          nanoseconds += 1e9;
        }
      }
      return [seconds,nanoseconds]
    }

    var startTime = new Date();
    function uptime() {
      var currentTime = new Date();
      var dif = currentTime - startTime;
      return dif / 1000;
    }

    var process$4 = {
      nextTick: nextTick,
      title: title,
      browser: browser,
      env: env,
      argv: argv,
      version: version$1,
      versions: versions$1,
      on: on,
      addListener: addListener,
      once: once,
      off: off,
      removeListener: removeListener,
      removeAllListeners: removeAllListeners,
      emit: emit,
      binding: binding,
      cwd: cwd,
      chdir: chdir,
      umask: umask,
      hrtime: hrtime,
      platform: platform,
      release: release,
      config: config,
      uptime: uptime
    };

    var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
      utils.forEach(headers, function processHeader(value, name) {
        if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
          headers[normalizedName] = value;
          delete headers[name];
        }
      });
    };

    /**
     * Update an Error with the specified config, error code, and response.
     *
     * @param {Error} error The error to update.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The error.
     */
    var enhanceError = function enhanceError(error, config, code, request, response) {
      error.config = config;
      if (code) {
        error.code = code;
      }

      error.request = request;
      error.response = response;
      error.isAxiosError = true;

      error.toJSON = function() {
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: this.config,
          code: this.code
        };
      };
      return error;
    };

    /**
     * Create an Error with the specified message, config, error code, request and response.
     *
     * @param {string} message The error message.
     * @param {Object} config The config.
     * @param {string} [code] The error code (for example, 'ECONNABORTED').
     * @param {Object} [request] The request.
     * @param {Object} [response] The response.
     * @returns {Error} The created error.
     */
    var createError = function createError(message, config, code, request, response) {
      var error = new Error(message);
      return enhanceError(error, config, code, request, response);
    };

    /**
     * Resolve or reject a Promise based on response status.
     *
     * @param {Function} resolve A function that resolves the promise.
     * @param {Function} reject A function that rejects the promise.
     * @param {object} response The response.
     */
    var settle = function settle(resolve, reject, response) {
      var validateStatus = response.config.validateStatus;
      if (!validateStatus || validateStatus(response.status)) {
        resolve(response);
      } else {
        reject(createError(
          'Request failed with status code ' + response.status,
          response.config,
          null,
          response.request,
          response
        ));
      }
    };

    /**
     * Determines whether the specified URL is absolute
     *
     * @param {string} url The URL to test
     * @returns {boolean} True if the specified URL is absolute, otherwise false
     */
    var isAbsoluteURL = function isAbsoluteURL(url) {
      // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
      // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
      // by any combination of letters, digits, plus, period, or hyphen.
      return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
    };

    /**
     * Creates a new URL by combining the specified URLs
     *
     * @param {string} baseURL The base URL
     * @param {string} relativeURL The relative URL
     * @returns {string} The combined URL
     */
    var combineURLs = function combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
    };

    /**
     * Creates a new URL by combining the baseURL with the requestedURL,
     * only when the requestedURL is not already an absolute URL.
     * If the requestURL is absolute, this function returns the requestedURL untouched.
     *
     * @param {string} baseURL The base URL
     * @param {string} requestedURL Absolute or relative URL to combine
     * @returns {string} The combined full path
     */
    var buildFullPath = function buildFullPath(baseURL, requestedURL) {
      if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
      }
      return requestedURL;
    };

    // Headers whose duplicates are ignored by node
    // c.f. https://nodejs.org/api/http.html#http_message_headers
    var ignoreDuplicateOf = [
      'age', 'authorization', 'content-length', 'content-type', 'etag',
      'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
      'last-modified', 'location', 'max-forwards', 'proxy-authorization',
      'referer', 'retry-after', 'user-agent'
    ];

    /**
     * Parse headers into an object
     *
     * ```
     * Date: Wed, 27 Aug 2014 08:58:49 GMT
     * Content-Type: application/json
     * Connection: keep-alive
     * Transfer-Encoding: chunked
     * ```
     *
     * @param {String} headers Headers needing to be parsed
     * @returns {Object} Headers parsed into an object
     */
    var parseHeaders = function parseHeaders(headers) {
      var parsed = {};
      var key;
      var val;
      var i;

      if (!headers) { return parsed; }

      utils.forEach(headers.split('\n'), function parser(line) {
        i = line.indexOf(':');
        key = utils.trim(line.substr(0, i)).toLowerCase();
        val = utils.trim(line.substr(i + 1));

        if (key) {
          if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
            return;
          }
          if (key === 'set-cookie') {
            parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
          } else {
            parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
          }
        }
      });

      return parsed;
    };

    var isURLSameOrigin = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs have full support of the APIs needed to test
      // whether the request URL is of the same origin as current location.
        (function standardBrowserEnv() {
          var msie = /(msie|trident)/i.test(navigator.userAgent);
          var urlParsingNode = document.createElement('a');
          var originURL;

          /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
          function resolveURL(url) {
            var href = url;

            if (msie) {
            // IE needs attribute set twice to normalize properties
              urlParsingNode.setAttribute('href', href);
              href = urlParsingNode.href;
            }

            urlParsingNode.setAttribute('href', href);

            // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
            return {
              href: urlParsingNode.href,
              protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
              host: urlParsingNode.host,
              search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
              hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
              hostname: urlParsingNode.hostname,
              port: urlParsingNode.port,
              pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                urlParsingNode.pathname :
                '/' + urlParsingNode.pathname
            };
          }

          originURL = resolveURL(window.location.href);

          /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
          return function isURLSameOrigin(requestURL) {
            var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
            return (parsed.protocol === originURL.protocol &&
                parsed.host === originURL.host);
          };
        })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return function isURLSameOrigin() {
            return true;
          };
        })()
    );

    var cookies = (
      utils.isStandardBrowserEnv() ?

      // Standard browser envs support document.cookie
        (function standardBrowserEnv() {
          return {
            write: function write(name, value, expires, path, domain, secure) {
              var cookie = [];
              cookie.push(name + '=' + encodeURIComponent(value));

              if (utils.isNumber(expires)) {
                cookie.push('expires=' + new Date(expires).toGMTString());
              }

              if (utils.isString(path)) {
                cookie.push('path=' + path);
              }

              if (utils.isString(domain)) {
                cookie.push('domain=' + domain);
              }

              if (secure === true) {
                cookie.push('secure');
              }

              document.cookie = cookie.join('; ');
            },

            read: function read(name) {
              var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
              return (match ? decodeURIComponent(match[3]) : null);
            },

            remove: function remove(name) {
              this.write(name, '', Date.now() - 86400000);
            }
          };
        })() :

      // Non standard browser env (web workers, react-native) lack needed support.
        (function nonStandardBrowserEnv() {
          return {
            write: function write() {},
            read: function read() { return null; },
            remove: function remove() {}
          };
        })()
    );

    var xhr = function xhrAdapter(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        var requestData = config.data;
        var requestHeaders = config.headers;

        if (utils.isFormData(requestData)) {
          delete requestHeaders['Content-Type']; // Let the browser set it
        }

        var request = new XMLHttpRequest();

        // HTTP basic authentication
        if (config.auth) {
          var username = config.auth.username || '';
          var password = config.auth.password || '';
          requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
        }

        var fullPath = buildFullPath(config.baseURL, config.url);
        request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

        // Set the request timeout in MS
        request.timeout = config.timeout;

        // Listen for ready state
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }

          // The request errored out and we didn't get a response, this will be
          // handled by onerror instead
          // With one exception: request that using file: protocol, most browsers
          // will return status as 0 even though it's a successful request
          if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
            return;
          }

          // Prepare the response
          var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
          var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
          var response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config: config,
            request: request
          };

          settle(resolve, reject, response);

          // Clean up request
          request = null;
        };

        // Handle browser request cancellation (as opposed to a manual cancellation)
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }

          reject(createError('Request aborted', config, 'ECONNABORTED', request));

          // Clean up request
          request = null;
        };

        // Handle low level network errors
        request.onerror = function handleError() {
          // Real errors are hidden from us by the browser
          // onerror should only fire if it's a network error
          reject(createError('Network Error', config, null, request));

          // Clean up request
          request = null;
        };

        // Handle timeout
        request.ontimeout = function handleTimeout() {
          var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
          if (config.timeoutErrorMessage) {
            timeoutErrorMessage = config.timeoutErrorMessage;
          }
          reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
            request));

          // Clean up request
          request = null;
        };

        // Add xsrf header
        // This is only done if running in a standard browser environment.
        // Specifically not if we're in a web worker, or react-native.
        if (utils.isStandardBrowserEnv()) {
          var cookies$1 = cookies;

          // Add xsrf header
          var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
            cookies$1.read(config.xsrfCookieName) :
            undefined;

          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }

        // Add headers to the request
        if ('setRequestHeader' in request) {
          utils.forEach(requestHeaders, function setRequestHeader(val, key) {
            if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
              // Remove Content-Type if data is undefined
              delete requestHeaders[key];
            } else {
              // Otherwise add header to the request
              request.setRequestHeader(key, val);
            }
          });
        }

        // Add withCredentials to request if needed
        if (!utils.isUndefined(config.withCredentials)) {
          request.withCredentials = !!config.withCredentials;
        }

        // Add responseType to request if needed
        if (config.responseType) {
          try {
            request.responseType = config.responseType;
          } catch (e) {
            // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
            // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
            if (config.responseType !== 'json') {
              throw e;
            }
          }
        }

        // Handle progress if needed
        if (typeof config.onDownloadProgress === 'function') {
          request.addEventListener('progress', config.onDownloadProgress);
        }

        // Not all browsers support upload events
        if (typeof config.onUploadProgress === 'function' && request.upload) {
          request.upload.addEventListener('progress', config.onUploadProgress);
        }

        if (config.cancelToken) {
          // Handle cancellation
          config.cancelToken.promise.then(function onCanceled(cancel) {
            if (!request) {
              return;
            }

            request.abort();
            reject(cancel);
            // Clean up request
            request = null;
          });
        }

        if (requestData === undefined) {
          requestData = null;
        }

        // Send the request
        request.send(requestData);
      });
    };

    var DEFAULT_CONTENT_TYPE = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    function setContentTypeIfUnset(headers, value) {
      if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
        headers['Content-Type'] = value;
      }
    }

    function getDefaultAdapter() {
      var adapter;
      if (typeof XMLHttpRequest !== 'undefined') {
        // For browsers use XHR adapter
        adapter = xhr;
      } else if (typeof process$4 !== 'undefined' && Object.prototype.toString.call(process$4) === '[object process]') {
        // For node use HTTP adapter
        adapter = xhr;
      }
      return adapter;
    }

    var defaults = {
      adapter: getDefaultAdapter(),

      transformRequest: [function transformRequest(data, headers) {
        normalizeHeaderName(headers, 'Accept');
        normalizeHeaderName(headers, 'Content-Type');
        if (utils.isFormData(data) ||
          utils.isArrayBuffer(data) ||
          utils.isBuffer(data) ||
          utils.isStream(data) ||
          utils.isFile(data) ||
          utils.isBlob(data)
        ) {
          return data;
        }
        if (utils.isArrayBufferView(data)) {
          return data.buffer;
        }
        if (utils.isURLSearchParams(data)) {
          setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
          return data.toString();
        }
        if (utils.isObject(data)) {
          setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
          return JSON.stringify(data);
        }
        return data;
      }],

      transformResponse: [function transformResponse(data) {
        /*eslint no-param-reassign:0*/
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) { /* Ignore */ }
        }
        return data;
      }],

      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,

      xsrfCookieName: 'XSRF-TOKEN',
      xsrfHeaderName: 'X-XSRF-TOKEN',

      maxContentLength: -1,

      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      }
    };

    defaults.headers = {
      common: {
        'Accept': 'application/json, text/plain, */*'
      }
    };

    utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
      defaults.headers[method] = {};
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
    });

    var defaults_1 = defaults;

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    function throwIfCancellationRequested(config) {
      if (config.cancelToken) {
        config.cancelToken.throwIfRequested();
      }
    }

    /**
     * Dispatch a request to the server using the configured adapter.
     *
     * @param {object} config The config that is to be used for the request
     * @returns {Promise} The Promise to be fulfilled
     */
    var dispatchRequest = function dispatchRequest(config) {
      throwIfCancellationRequested(config);

      // Ensure headers exist
      config.headers = config.headers || {};

      // Transform request data
      config.data = transformData(
        config.data,
        config.headers,
        config.transformRequest
      );

      // Flatten headers
      config.headers = utils.merge(
        config.headers.common || {},
        config.headers[config.method] || {},
        config.headers
      );

      utils.forEach(
        ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
        function cleanHeaderConfig(method) {
          delete config.headers[method];
        }
      );

      var adapter = config.adapter || defaults_1.adapter;

      return adapter(config).then(function onAdapterResolution(response) {
        throwIfCancellationRequested(config);

        // Transform response data
        response.data = transformData(
          response.data,
          response.headers,
          config.transformResponse
        );

        return response;
      }, function onAdapterRejection(reason) {
        if (!isCancel(reason)) {
          throwIfCancellationRequested(config);

          // Transform response data
          if (reason && reason.response) {
            reason.response.data = transformData(
              reason.response.data,
              reason.response.headers,
              config.transformResponse
            );
          }
        }

        return Promise.reject(reason);
      });
    };

    /**
     * Config-specific merge-function which creates a new config-object
     * by merging two configuration objects together.
     *
     * @param {Object} config1
     * @param {Object} config2
     * @returns {Object} New object resulting from merging config2 to config1
     */
    var mergeConfig = function mergeConfig(config1, config2) {
      // eslint-disable-next-line no-param-reassign
      config2 = config2 || {};
      var config = {};

      var valueFromConfig2Keys = ['url', 'method', 'params', 'data'];
      var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy'];
      var defaultToConfig2Keys = [
        'baseURL', 'url', 'transformRequest', 'transformResponse', 'paramsSerializer',
        'timeout', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
        'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress',
        'maxContentLength', 'validateStatus', 'maxRedirects', 'httpAgent',
        'httpsAgent', 'cancelToken', 'socketPath'
      ];

      utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
        if (typeof config2[prop] !== 'undefined') {
          config[prop] = config2[prop];
        }
      });

      utils.forEach(mergeDeepPropertiesKeys, function mergeDeepProperties(prop) {
        if (utils.isObject(config2[prop])) {
          config[prop] = utils.deepMerge(config1[prop], config2[prop]);
        } else if (typeof config2[prop] !== 'undefined') {
          config[prop] = config2[prop];
        } else if (utils.isObject(config1[prop])) {
          config[prop] = utils.deepMerge(config1[prop]);
        } else if (typeof config1[prop] !== 'undefined') {
          config[prop] = config1[prop];
        }
      });

      utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
        if (typeof config2[prop] !== 'undefined') {
          config[prop] = config2[prop];
        } else if (typeof config1[prop] !== 'undefined') {
          config[prop] = config1[prop];
        }
      });

      var axiosKeys = valueFromConfig2Keys
        .concat(mergeDeepPropertiesKeys)
        .concat(defaultToConfig2Keys);

      var otherKeys = Object
        .keys(config2)
        .filter(function filterAxiosKeys(key) {
          return axiosKeys.indexOf(key) === -1;
        });

      utils.forEach(otherKeys, function otherKeysDefaultToConfig2(prop) {
        if (typeof config2[prop] !== 'undefined') {
          config[prop] = config2[prop];
        } else if (typeof config1[prop] !== 'undefined') {
          config[prop] = config1[prop];
        }
      });

      return config;
    };

    /**
     * Create a new instance of Axios
     *
     * @param {Object} instanceConfig The default config for the instance
     */
    function Axios(instanceConfig) {
      this.defaults = instanceConfig;
      this.interceptors = {
        request: new InterceptorManager_1(),
        response: new InterceptorManager_1()
      };
    }

    /**
     * Dispatch a request
     *
     * @param {Object} config The config specific for this request (merged with this.defaults)
     */
    Axios.prototype.request = function request(config) {
      /*eslint no-param-reassign:0*/
      // Allow for axios('example/url'[, config]) a la fetch API
      if (typeof config === 'string') {
        config = arguments[1] || {};
        config.url = arguments[0];
      } else {
        config = config || {};
      }

      config = mergeConfig(this.defaults, config);

      // Set config.method
      if (config.method) {
        config.method = config.method.toLowerCase();
      } else if (this.defaults.method) {
        config.method = this.defaults.method.toLowerCase();
      } else {
        config.method = 'get';
      }

      // Hook up interceptors middleware
      var chain = [dispatchRequest, undefined];
      var promise = Promise.resolve(config);

      this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
        chain.unshift(interceptor.fulfilled, interceptor.rejected);
      });

      this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
        chain.push(interceptor.fulfilled, interceptor.rejected);
      });

      while (chain.length) {
        promise = promise.then(chain.shift(), chain.shift());
      }

      return promise;
    };

    Axios.prototype.getUri = function getUri(config) {
      config = mergeConfig(this.defaults, config);
      return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
    };

    // Provide aliases for supported request methods
    utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, config) {
        return this.request(utils.merge(config || {}, {
          method: method,
          url: url
        }));
      };
    });

    utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
      /*eslint func-names:0*/
      Axios.prototype[method] = function(url, data, config) {
        return this.request(utils.merge(config || {}, {
          method: method,
          url: url,
          data: data
        }));
      };
    });

    var Axios_1 = Axios;

    /**
     * A `Cancel` is an object that is thrown when an operation is canceled.
     *
     * @class
     * @param {string=} message The message.
     */
    function Cancel(message) {
      this.message = message;
    }

    Cancel.prototype.toString = function toString() {
      return 'Cancel' + (this.message ? ': ' + this.message : '');
    };

    Cancel.prototype.__CANCEL__ = true;

    var Cancel_1 = Cancel;

    /**
     * A `CancelToken` is an object that can be used to request cancellation of an operation.
     *
     * @class
     * @param {Function} executor The executor function.
     */
    function CancelToken(executor) {
      if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
      }

      var resolvePromise;
      this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
      });

      var token = this;
      executor(function cancel(message) {
        if (token.reason) {
          // Cancellation has already been requested
          return;
        }

        token.reason = new Cancel_1(message);
        resolvePromise(token.reason);
      });
    }

    /**
     * Throws a `Cancel` if cancellation has been requested.
     */
    CancelToken.prototype.throwIfRequested = function throwIfRequested() {
      if (this.reason) {
        throw this.reason;
      }
    };

    /**
     * Returns an object that contains a new `CancelToken` and a function that, when called,
     * cancels the `CancelToken`.
     */
    CancelToken.source = function source() {
      var cancel;
      var token = new CancelToken(function executor(c) {
        cancel = c;
      });
      return {
        token: token,
        cancel: cancel
      };
    };

    var CancelToken_1 = CancelToken;

    /**
     * Syntactic sugar for invoking a function and expanding an array for arguments.
     *
     * Common use case would be to use `Function.prototype.apply`.
     *
     *  ```js
     *  function f(x, y, z) {}
     *  var args = [1, 2, 3];
     *  f.apply(null, args);
     *  ```
     *
     * With `spread` this example can be re-written.
     *
     *  ```js
     *  spread(function(x, y, z) {})([1, 2, 3]);
     *  ```
     *
     * @param {Function} callback
     * @returns {Function}
     */
    var spread = function spread(callback) {
      return function wrap(arr) {
        return callback.apply(null, arr);
      };
    };

    /**
     * Create an instance of Axios
     *
     * @param {Object} defaultConfig The default config for the instance
     * @return {Axios} A new instance of Axios
     */
    function createInstance(defaultConfig) {
      var context = new Axios_1(defaultConfig);
      var instance = bind$1(Axios_1.prototype.request, context);

      // Copy axios.prototype to instance
      utils.extend(instance, Axios_1.prototype, context);

      // Copy context to instance
      utils.extend(instance, context);

      return instance;
    }

    // Create the default instance to be exported
    var axios = createInstance(defaults_1);

    // Expose Axios class to allow class inheritance
    axios.Axios = Axios_1;

    // Factory for creating new instances
    axios.create = function create(instanceConfig) {
      return createInstance(mergeConfig(axios.defaults, instanceConfig));
    };

    // Expose Cancel & CancelToken
    axios.Cancel = Cancel_1;
    axios.CancelToken = CancelToken_1;
    axios.isCancel = isCancel;

    // Expose all/spread
    axios.all = function all(promises) {
      return Promise.all(promises);
    };
    axios.spread = spread;

    var axios_1 = axios;

    // Allow use of default import syntax in TypeScript
    var _default = axios;
    axios_1.default = _default;

    var axios$1 = axios_1;

    var download = createCommonjsModule(function (module, exports) {
    //download.js v4.2, by dandavis; 2008-2016. [MIT] see http://danml.com/download.html for tests/usage
    // v1 landed a FF+Chrome compat way of downloading strings to local un-named files, upgraded to use a hidden frame and optional mime
    // v2 added named files via a[download], msSaveBlob, IE (10+) support, and window.URL support for larger+faster saves than dataURLs
    // v3 added dataURL and Blob Input, bind-toggle arity, and legacy dataURL fallback was improved with force-download mime and base64 support. 3.1 improved safari handling.
    // v4 adds AMD/UMD, commonJS, and plain browser support
    // v4.1 adds url download capability via solo URL argument (same domain/CORS only)
    // v4.2 adds semantic variable names, long (over 2MB) dataURL support, and hidden by default temp anchors
    // https://github.com/rndme/download

    (function (root, factory) {
    	{
    		// Node. Does not work with strict CommonJS, but
    		// only CommonJS-like environments that support module.exports,
    		// like Node.
    		module.exports = factory();
    	}
    }(commonjsGlobal, function () {

    	return function download(data, strFileName, strMimeType) {

    		var self = window, // this script is only for browsers anyway...
    			defaultMime = "application/octet-stream", // this default mime also triggers iframe downloads
    			mimeType = strMimeType || defaultMime,
    			payload = data,
    			url = !strFileName && !strMimeType && payload,
    			anchor = document.createElement("a"),
    			toString = function(a){return String(a);},
    			myBlob = (self.Blob || self.MozBlob || self.WebKitBlob || toString),
    			fileName = strFileName || "download",
    			blob,
    			reader;
    			myBlob= myBlob.call ? myBlob.bind(self) : Blob ;
    	  
    		if(String(this)==="true"){ //reverse arguments, allowing download.bind(true, "text/xml", "export.xml") to act as a callback
    			payload=[payload, mimeType];
    			mimeType=payload[0];
    			payload=payload[1];
    		}


    		if(url && url.length< 2048){ // if no filename and no mime, assume a url was passed as the only argument
    			fileName = url.split("/").pop().split("?")[0];
    			anchor.href = url; // assign href prop to temp anchor
    		  	if(anchor.href.indexOf(url) !== -1){ // if the browser determines that it's a potentially valid url path:
            		var ajax=new XMLHttpRequest();
            		ajax.open( "GET", url, true);
            		ajax.responseType = 'blob';
            		ajax.onload= function(e){ 
    				  download(e.target.response, fileName, defaultMime);
    				};
            		setTimeout(function(){ ajax.send();}, 0); // allows setting custom ajax headers using the return:
    			    return ajax;
    			} // end if valid url?
    		} // end if url?


    		//go ahead and download dataURLs right away
    		if(/^data:([\w+-]+\/[\w+.-]+)?[,;]/.test(payload)){
    		
    			if(payload.length > (1024*1024*1.999) && myBlob !== toString ){
    				payload=dataUrlToBlob(payload);
    				mimeType=payload.type || defaultMime;
    			}else {			
    				return navigator.msSaveBlob ?  // IE10 can't do a[download], only Blobs:
    					navigator.msSaveBlob(dataUrlToBlob(payload), fileName) :
    					saver(payload) ; // everyone else can save dataURLs un-processed
    			}
    			
    		}else {//not data url, is it a string with special needs?
    			if(/([\x80-\xff])/.test(payload)){			  
    				var i=0, tempUiArr= new Uint8Array(payload.length), mx=tempUiArr.length;
    				for(i;i<mx;++i) tempUiArr[i]= payload.charCodeAt(i);
    			 	payload=new myBlob([tempUiArr], {type: mimeType});
    			}		  
    		}
    		blob = payload instanceof myBlob ?
    			payload :
    			new myBlob([payload], {type: mimeType}) ;


    		function dataUrlToBlob(strUrl) {
    			var parts= strUrl.split(/[:;,]/),
    			type= parts[1],
    			decoder= parts[2] == "base64" ? atob : decodeURIComponent,
    			binData= decoder( parts.pop() ),
    			mx= binData.length,
    			i= 0,
    			uiArr= new Uint8Array(mx);

    			for(i;i<mx;++i) uiArr[i]= binData.charCodeAt(i);

    			return new myBlob([uiArr], {type: type});
    		 }

    		function saver(url, winMode){

    			if ('download' in anchor) { //html5 A[download]
    				anchor.href = url;
    				anchor.setAttribute("download", fileName);
    				anchor.className = "download-js-link";
    				anchor.innerHTML = "downloading...";
    				anchor.style.display = "none";
    				document.body.appendChild(anchor);
    				setTimeout(function() {
    					anchor.click();
    					document.body.removeChild(anchor);
    					if(winMode===true){setTimeout(function(){ self.URL.revokeObjectURL(anchor.href);}, 250 );}
    				}, 66);
    				return true;
    			}

    			// handle non-a[download] safari as best we can:
    			if(/(Version)\/(\d+)\.(\d+)(?:\.(\d+))?.*Safari\//.test(navigator.userAgent)) {
    				if(/^data:/.test(url))	url="data:"+url.replace(/^data:([\w\/\-\+]+)/, defaultMime);
    				if(!window.open(url)){ // popup blocked, offer direct download:
    					if(confirm("Displaying New Document\n\nUse Save As... to download, then click back to return to this page.")){ location.href=url; }
    				}
    				return true;
    			}

    			//do iframe dataURL download (old ch+FF):
    			var f = document.createElement("iframe");
    			document.body.appendChild(f);

    			if(!winMode && /^data:/.test(url)){ // force a mime that will download:
    				url="data:"+url.replace(/^data:([\w\/\-\+]+)/, defaultMime);
    			}
    			f.src=url;
    			setTimeout(function(){ document.body.removeChild(f); }, 333);

    		}//end saver




    		if (navigator.msSaveBlob) { // IE10+ : (has Blob, but not a[download] or URL)
    			return navigator.msSaveBlob(blob, fileName);
    		}

    		if(self.URL){ // simple fast and modern way using Blob and URL:
    			saver(self.URL.createObjectURL(blob), true);
    		}else {
    			// handle non-Blob()+non-URL browsers:
    			if(typeof blob === "string" || blob.constructor===toString ){
    				try{
    					return saver( "data:" +  mimeType   + ";base64,"  +  self.btoa(blob)  );
    				}catch(y){
    					return saver( "data:" +  mimeType   + "," + encodeURIComponent(blob)  );
    				}
    			}

    			// Blob but not URL support:
    			reader=new FileReader();
    			reader.onload=function(e){
    				saver(this.result);
    			};
    			reader.readAsDataURL(blob);
    		}
    		return true;
    	}; /* end download() */
    }));
    });

    function createSectionStore(initial) {
      var initialState = {
        section: initial
      };
      return writable(initialState);
    }

    // `Array.prototype.fill` method implementation
    // https://tc39.github.io/ecma262/#sec-array.prototype.fill
    var arrayFill = function fill(value /* , start = 0, end = @length */) {
      var O = toObject(this);
      var length = toLength(O.length);
      var argumentsLength = arguments.length;
      var index = toAbsoluteIndex(argumentsLength > 1 ? arguments[1] : undefined, length);
      var end = argumentsLength > 2 ? arguments[2] : undefined;
      var endPos = end === undefined ? length : toAbsoluteIndex(end, length);
      while (endPos > index) O[index++] = value;
      return O;
    };

    // `Array.prototype.fill` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.fill
    _export({ target: 'Array', proto: true }, {
      fill: arrayFill
    });

    // https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
    addToUnscopables('fill');

    var arrayBufferNative = typeof ArrayBuffer !== 'undefined' && typeof DataView !== 'undefined';

    // `ToIndex` abstract operation
    // https://tc39.github.io/ecma262/#sec-toindex
    var toIndex = function (it) {
      if (it === undefined) return 0;
      var number = toInteger(it);
      var length = toLength(number);
      if (number !== length) throw RangeError('Wrong length or index');
      return length;
    };

    // IEEE754 conversions based on https://github.com/feross/ieee754
    // eslint-disable-next-line no-shadow-restricted-names
    var Infinity = 1 / 0;
    var abs = Math.abs;
    var pow = Math.pow;
    var floor$1 = Math.floor;
    var log = Math.log;
    var LN2 = Math.LN2;

    var pack = function (number, mantissaLength, bytes) {
      var buffer = new Array(bytes);
      var exponentLength = bytes * 8 - mantissaLength - 1;
      var eMax = (1 << exponentLength) - 1;
      var eBias = eMax >> 1;
      var rt = mantissaLength === 23 ? pow(2, -24) - pow(2, -77) : 0;
      var sign = number < 0 || number === 0 && 1 / number < 0 ? 1 : 0;
      var index = 0;
      var exponent, mantissa, c;
      number = abs(number);
      // eslint-disable-next-line no-self-compare
      if (number != number || number === Infinity) {
        // eslint-disable-next-line no-self-compare
        mantissa = number != number ? 1 : 0;
        exponent = eMax;
      } else {
        exponent = floor$1(log(number) / LN2);
        if (number * (c = pow(2, -exponent)) < 1) {
          exponent--;
          c *= 2;
        }
        if (exponent + eBias >= 1) {
          number += rt / c;
        } else {
          number += rt * pow(2, 1 - eBias);
        }
        if (number * c >= 2) {
          exponent++;
          c /= 2;
        }
        if (exponent + eBias >= eMax) {
          mantissa = 0;
          exponent = eMax;
        } else if (exponent + eBias >= 1) {
          mantissa = (number * c - 1) * pow(2, mantissaLength);
          exponent = exponent + eBias;
        } else {
          mantissa = number * pow(2, eBias - 1) * pow(2, mantissaLength);
          exponent = 0;
        }
      }
      for (; mantissaLength >= 8; buffer[index++] = mantissa & 255, mantissa /= 256, mantissaLength -= 8);
      exponent = exponent << mantissaLength | mantissa;
      exponentLength += mantissaLength;
      for (; exponentLength > 0; buffer[index++] = exponent & 255, exponent /= 256, exponentLength -= 8);
      buffer[--index] |= sign * 128;
      return buffer;
    };

    var unpack = function (buffer, mantissaLength) {
      var bytes = buffer.length;
      var exponentLength = bytes * 8 - mantissaLength - 1;
      var eMax = (1 << exponentLength) - 1;
      var eBias = eMax >> 1;
      var nBits = exponentLength - 7;
      var index = bytes - 1;
      var sign = buffer[index--];
      var exponent = sign & 127;
      var mantissa;
      sign >>= 7;
      for (; nBits > 0; exponent = exponent * 256 + buffer[index], index--, nBits -= 8);
      mantissa = exponent & (1 << -nBits) - 1;
      exponent >>= -nBits;
      nBits += mantissaLength;
      for (; nBits > 0; mantissa = mantissa * 256 + buffer[index], index--, nBits -= 8);
      if (exponent === 0) {
        exponent = 1 - eBias;
      } else if (exponent === eMax) {
        return mantissa ? NaN : sign ? -Infinity : Infinity;
      } else {
        mantissa = mantissa + pow(2, mantissaLength);
        exponent = exponent - eBias;
      } return (sign ? -1 : 1) * mantissa * pow(2, exponent - mantissaLength);
    };

    var ieee754 = {
      pack: pack,
      unpack: unpack
    };

    var getOwnPropertyNames = objectGetOwnPropertyNames.f;
    var defineProperty$2 = objectDefineProperty.f;




    var getInternalState$3 = internalState.get;
    var setInternalState$3 = internalState.set;
    var ARRAY_BUFFER = 'ArrayBuffer';
    var DATA_VIEW = 'DataView';
    var PROTOTYPE$1 = 'prototype';
    var WRONG_LENGTH = 'Wrong length';
    var WRONG_INDEX = 'Wrong index';
    var NativeArrayBuffer = global_1[ARRAY_BUFFER];
    var $ArrayBuffer = NativeArrayBuffer;
    var $DataView = global_1[DATA_VIEW];
    var $DataViewPrototype = $DataView && $DataView[PROTOTYPE$1];
    var ObjectPrototype$1 = Object.prototype;
    var RangeError$1 = global_1.RangeError;

    var packIEEE754 = ieee754.pack;
    var unpackIEEE754 = ieee754.unpack;

    var packInt8 = function (number) {
      return [number & 0xFF];
    };

    var packInt16 = function (number) {
      return [number & 0xFF, number >> 8 & 0xFF];
    };

    var packInt32 = function (number) {
      return [number & 0xFF, number >> 8 & 0xFF, number >> 16 & 0xFF, number >> 24 & 0xFF];
    };

    var unpackInt32 = function (buffer) {
      return buffer[3] << 24 | buffer[2] << 16 | buffer[1] << 8 | buffer[0];
    };

    var packFloat32 = function (number) {
      return packIEEE754(number, 23, 4);
    };

    var packFloat64 = function (number) {
      return packIEEE754(number, 52, 8);
    };

    var addGetter = function (Constructor, key) {
      defineProperty$2(Constructor[PROTOTYPE$1], key, { get: function () { return getInternalState$3(this)[key]; } });
    };

    var get$1 = function (view, count, index, isLittleEndian) {
      var intIndex = toIndex(index);
      var store = getInternalState$3(view);
      if (intIndex + count > store.byteLength) throw RangeError$1(WRONG_INDEX);
      var bytes = getInternalState$3(store.buffer).bytes;
      var start = intIndex + store.byteOffset;
      var pack = bytes.slice(start, start + count);
      return isLittleEndian ? pack : pack.reverse();
    };

    var set$2 = function (view, count, index, conversion, value, isLittleEndian) {
      var intIndex = toIndex(index);
      var store = getInternalState$3(view);
      if (intIndex + count > store.byteLength) throw RangeError$1(WRONG_INDEX);
      var bytes = getInternalState$3(store.buffer).bytes;
      var start = intIndex + store.byteOffset;
      var pack = conversion(+value);
      for (var i = 0; i < count; i++) bytes[start + i] = pack[isLittleEndian ? i : count - i - 1];
    };

    if (!arrayBufferNative) {
      $ArrayBuffer = function ArrayBuffer(length) {
        anInstance(this, $ArrayBuffer, ARRAY_BUFFER);
        var byteLength = toIndex(length);
        setInternalState$3(this, {
          bytes: arrayFill.call(new Array(byteLength), 0),
          byteLength: byteLength
        });
        if (!descriptors) this.byteLength = byteLength;
      };

      $DataView = function DataView(buffer, byteOffset, byteLength) {
        anInstance(this, $DataView, DATA_VIEW);
        anInstance(buffer, $ArrayBuffer, DATA_VIEW);
        var bufferLength = getInternalState$3(buffer).byteLength;
        var offset = toInteger(byteOffset);
        if (offset < 0 || offset > bufferLength) throw RangeError$1('Wrong offset');
        byteLength = byteLength === undefined ? bufferLength - offset : toLength(byteLength);
        if (offset + byteLength > bufferLength) throw RangeError$1(WRONG_LENGTH);
        setInternalState$3(this, {
          buffer: buffer,
          byteLength: byteLength,
          byteOffset: offset
        });
        if (!descriptors) {
          this.buffer = buffer;
          this.byteLength = byteLength;
          this.byteOffset = offset;
        }
      };

      if (descriptors) {
        addGetter($ArrayBuffer, 'byteLength');
        addGetter($DataView, 'buffer');
        addGetter($DataView, 'byteLength');
        addGetter($DataView, 'byteOffset');
      }

      redefineAll($DataView[PROTOTYPE$1], {
        getInt8: function getInt8(byteOffset) {
          return get$1(this, 1, byteOffset)[0] << 24 >> 24;
        },
        getUint8: function getUint8(byteOffset) {
          return get$1(this, 1, byteOffset)[0];
        },
        getInt16: function getInt16(byteOffset /* , littleEndian */) {
          var bytes = get$1(this, 2, byteOffset, arguments.length > 1 ? arguments[1] : undefined);
          return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
        },
        getUint16: function getUint16(byteOffset /* , littleEndian */) {
          var bytes = get$1(this, 2, byteOffset, arguments.length > 1 ? arguments[1] : undefined);
          return bytes[1] << 8 | bytes[0];
        },
        getInt32: function getInt32(byteOffset /* , littleEndian */) {
          return unpackInt32(get$1(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : undefined));
        },
        getUint32: function getUint32(byteOffset /* , littleEndian */) {
          return unpackInt32(get$1(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : undefined)) >>> 0;
        },
        getFloat32: function getFloat32(byteOffset /* , littleEndian */) {
          return unpackIEEE754(get$1(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : undefined), 23);
        },
        getFloat64: function getFloat64(byteOffset /* , littleEndian */) {
          return unpackIEEE754(get$1(this, 8, byteOffset, arguments.length > 1 ? arguments[1] : undefined), 52);
        },
        setInt8: function setInt8(byteOffset, value) {
          set$2(this, 1, byteOffset, packInt8, value);
        },
        setUint8: function setUint8(byteOffset, value) {
          set$2(this, 1, byteOffset, packInt8, value);
        },
        setInt16: function setInt16(byteOffset, value /* , littleEndian */) {
          set$2(this, 2, byteOffset, packInt16, value, arguments.length > 2 ? arguments[2] : undefined);
        },
        setUint16: function setUint16(byteOffset, value /* , littleEndian */) {
          set$2(this, 2, byteOffset, packInt16, value, arguments.length > 2 ? arguments[2] : undefined);
        },
        setInt32: function setInt32(byteOffset, value /* , littleEndian */) {
          set$2(this, 4, byteOffset, packInt32, value, arguments.length > 2 ? arguments[2] : undefined);
        },
        setUint32: function setUint32(byteOffset, value /* , littleEndian */) {
          set$2(this, 4, byteOffset, packInt32, value, arguments.length > 2 ? arguments[2] : undefined);
        },
        setFloat32: function setFloat32(byteOffset, value /* , littleEndian */) {
          set$2(this, 4, byteOffset, packFloat32, value, arguments.length > 2 ? arguments[2] : undefined);
        },
        setFloat64: function setFloat64(byteOffset, value /* , littleEndian */) {
          set$2(this, 8, byteOffset, packFloat64, value, arguments.length > 2 ? arguments[2] : undefined);
        }
      });
    } else {
      if (!fails(function () {
        NativeArrayBuffer(1);
      }) || !fails(function () {
        new NativeArrayBuffer(-1); // eslint-disable-line no-new
      }) || fails(function () {
        new NativeArrayBuffer(); // eslint-disable-line no-new
        new NativeArrayBuffer(1.5); // eslint-disable-line no-new
        new NativeArrayBuffer(NaN); // eslint-disable-line no-new
        return NativeArrayBuffer.name != ARRAY_BUFFER;
      })) {
        $ArrayBuffer = function ArrayBuffer(length) {
          anInstance(this, $ArrayBuffer);
          return new NativeArrayBuffer(toIndex(length));
        };
        var ArrayBufferPrototype = $ArrayBuffer[PROTOTYPE$1] = NativeArrayBuffer[PROTOTYPE$1];
        for (var keys$1 = getOwnPropertyNames(NativeArrayBuffer), j = 0, key; keys$1.length > j;) {
          if (!((key = keys$1[j++]) in $ArrayBuffer)) {
            createNonEnumerableProperty($ArrayBuffer, key, NativeArrayBuffer[key]);
          }
        }
        ArrayBufferPrototype.constructor = $ArrayBuffer;
      }

      // WebKit bug - the same parent prototype for typed arrays and data view
      if (objectSetPrototypeOf && objectGetPrototypeOf($DataViewPrototype) !== ObjectPrototype$1) {
        objectSetPrototypeOf($DataViewPrototype, ObjectPrototype$1);
      }

      // iOS Safari 7.x bug
      var testView = new $DataView(new $ArrayBuffer(2));
      var nativeSetInt8 = $DataViewPrototype.setInt8;
      testView.setInt8(0, 2147483648);
      testView.setInt8(1, 2147483649);
      if (testView.getInt8(0) || !testView.getInt8(1)) redefineAll($DataViewPrototype, {
        setInt8: function setInt8(byteOffset, value) {
          nativeSetInt8.call(this, byteOffset, value << 24 >> 24);
        },
        setUint8: function setUint8(byteOffset, value) {
          nativeSetInt8.call(this, byteOffset, value << 24 >> 24);
        }
      }, { unsafe: true });
    }

    setToStringTag($ArrayBuffer, ARRAY_BUFFER);
    setToStringTag($DataView, DATA_VIEW);

    var arrayBuffer = {
      ArrayBuffer: $ArrayBuffer,
      DataView: $DataView
    };

    var ArrayBuffer$1 = arrayBuffer.ArrayBuffer;
    var DataView$1 = arrayBuffer.DataView;
    var nativeArrayBufferSlice = ArrayBuffer$1.prototype.slice;

    var INCORRECT_SLICE = fails(function () {
      return !new ArrayBuffer$1(2).slice(1, undefined).byteLength;
    });

    // `ArrayBuffer.prototype.slice` method
    // https://tc39.github.io/ecma262/#sec-arraybuffer.prototype.slice
    _export({ target: 'ArrayBuffer', proto: true, unsafe: true, forced: INCORRECT_SLICE }, {
      slice: function slice(start, end) {
        if (nativeArrayBufferSlice !== undefined && end === undefined) {
          return nativeArrayBufferSlice.call(anObject(this), start); // FF fix
        }
        var length = anObject(this).byteLength;
        var first = toAbsoluteIndex(start, length);
        var fin = toAbsoluteIndex(end === undefined ? length : end, length);
        var result = new (speciesConstructor(this, ArrayBuffer$1))(toLength(fin - first));
        var viewSource = new DataView$1(this);
        var viewTarget = new DataView$1(result);
        var index = 0;
        while (first < fin) {
          viewTarget.setUint8(index++, viewSource.getUint8(first++));
        } return result;
      }
    });

    var defineProperty$3 = objectDefineProperty.f;





    var Int8Array$1 = global_1.Int8Array;
    var Int8ArrayPrototype = Int8Array$1 && Int8Array$1.prototype;
    var Uint8ClampedArray = global_1.Uint8ClampedArray;
    var Uint8ClampedArrayPrototype = Uint8ClampedArray && Uint8ClampedArray.prototype;
    var TypedArray = Int8Array$1 && objectGetPrototypeOf(Int8Array$1);
    var TypedArrayPrototype = Int8ArrayPrototype && objectGetPrototypeOf(Int8ArrayPrototype);
    var ObjectPrototype$2 = Object.prototype;
    var isPrototypeOf = ObjectPrototype$2.isPrototypeOf;

    var TO_STRING_TAG$4 = wellKnownSymbol('toStringTag');
    var TYPED_ARRAY_TAG = uid('TYPED_ARRAY_TAG');
    // Fixing native typed arrays in Opera Presto crashes the browser, see #595
    var NATIVE_ARRAY_BUFFER_VIEWS = arrayBufferNative && !!objectSetPrototypeOf && classof(global_1.opera) !== 'Opera';
    var TYPED_ARRAY_TAG_REQIRED = false;
    var NAME;

    var TypedArrayConstructorsList = {
      Int8Array: 1,
      Uint8Array: 1,
      Uint8ClampedArray: 1,
      Int16Array: 2,
      Uint16Array: 2,
      Int32Array: 4,
      Uint32Array: 4,
      Float32Array: 4,
      Float64Array: 8
    };

    var isView = function isView(it) {
      var klass = classof(it);
      return klass === 'DataView' || has(TypedArrayConstructorsList, klass);
    };

    var isTypedArray = function (it) {
      return isObject(it) && has(TypedArrayConstructorsList, classof(it));
    };

    var aTypedArray = function (it) {
      if (isTypedArray(it)) return it;
      throw TypeError('Target is not a typed array');
    };

    var aTypedArrayConstructor = function (C) {
      if (objectSetPrototypeOf) {
        if (isPrototypeOf.call(TypedArray, C)) return C;
      } else for (var ARRAY in TypedArrayConstructorsList) if (has(TypedArrayConstructorsList, NAME)) {
        var TypedArrayConstructor = global_1[ARRAY];
        if (TypedArrayConstructor && (C === TypedArrayConstructor || isPrototypeOf.call(TypedArrayConstructor, C))) {
          return C;
        }
      } throw TypeError('Target is not a typed array constructor');
    };

    var exportTypedArrayMethod = function (KEY, property, forced) {
      if (!descriptors) return;
      if (forced) for (var ARRAY in TypedArrayConstructorsList) {
        var TypedArrayConstructor = global_1[ARRAY];
        if (TypedArrayConstructor && has(TypedArrayConstructor.prototype, KEY)) {
          delete TypedArrayConstructor.prototype[KEY];
        }
      }
      if (!TypedArrayPrototype[KEY] || forced) {
        redefine(TypedArrayPrototype, KEY, forced ? property
          : NATIVE_ARRAY_BUFFER_VIEWS && Int8ArrayPrototype[KEY] || property);
      }
    };

    var exportTypedArrayStaticMethod = function (KEY, property, forced) {
      var ARRAY, TypedArrayConstructor;
      if (!descriptors) return;
      if (objectSetPrototypeOf) {
        if (forced) for (ARRAY in TypedArrayConstructorsList) {
          TypedArrayConstructor = global_1[ARRAY];
          if (TypedArrayConstructor && has(TypedArrayConstructor, KEY)) {
            delete TypedArrayConstructor[KEY];
          }
        }
        if (!TypedArray[KEY] || forced) {
          // V8 ~ Chrome 49-50 `%TypedArray%` methods are non-writable non-configurable
          try {
            return redefine(TypedArray, KEY, forced ? property : NATIVE_ARRAY_BUFFER_VIEWS && Int8Array$1[KEY] || property);
          } catch (error) { /* empty */ }
        } else return;
      }
      for (ARRAY in TypedArrayConstructorsList) {
        TypedArrayConstructor = global_1[ARRAY];
        if (TypedArrayConstructor && (!TypedArrayConstructor[KEY] || forced)) {
          redefine(TypedArrayConstructor, KEY, property);
        }
      }
    };

    for (NAME in TypedArrayConstructorsList) {
      if (!global_1[NAME]) NATIVE_ARRAY_BUFFER_VIEWS = false;
    }

    // WebKit bug - typed arrays constructors prototype is Object.prototype
    if (!NATIVE_ARRAY_BUFFER_VIEWS || typeof TypedArray != 'function' || TypedArray === Function.prototype) {
      // eslint-disable-next-line no-shadow
      TypedArray = function TypedArray() {
        throw TypeError('Incorrect invocation');
      };
      if (NATIVE_ARRAY_BUFFER_VIEWS) for (NAME in TypedArrayConstructorsList) {
        if (global_1[NAME]) objectSetPrototypeOf(global_1[NAME], TypedArray);
      }
    }

    if (!NATIVE_ARRAY_BUFFER_VIEWS || !TypedArrayPrototype || TypedArrayPrototype === ObjectPrototype$2) {
      TypedArrayPrototype = TypedArray.prototype;
      if (NATIVE_ARRAY_BUFFER_VIEWS) for (NAME in TypedArrayConstructorsList) {
        if (global_1[NAME]) objectSetPrototypeOf(global_1[NAME].prototype, TypedArrayPrototype);
      }
    }

    // WebKit bug - one more object in Uint8ClampedArray prototype chain
    if (NATIVE_ARRAY_BUFFER_VIEWS && objectGetPrototypeOf(Uint8ClampedArrayPrototype) !== TypedArrayPrototype) {
      objectSetPrototypeOf(Uint8ClampedArrayPrototype, TypedArrayPrototype);
    }

    if (descriptors && !has(TypedArrayPrototype, TO_STRING_TAG$4)) {
      TYPED_ARRAY_TAG_REQIRED = true;
      defineProperty$3(TypedArrayPrototype, TO_STRING_TAG$4, { get: function () {
        return isObject(this) ? this[TYPED_ARRAY_TAG] : undefined;
      } });
      for (NAME in TypedArrayConstructorsList) if (global_1[NAME]) {
        createNonEnumerableProperty(global_1[NAME], TYPED_ARRAY_TAG, NAME);
      }
    }

    var arrayBufferViewCore = {
      NATIVE_ARRAY_BUFFER_VIEWS: NATIVE_ARRAY_BUFFER_VIEWS,
      TYPED_ARRAY_TAG: TYPED_ARRAY_TAG_REQIRED && TYPED_ARRAY_TAG,
      aTypedArray: aTypedArray,
      aTypedArrayConstructor: aTypedArrayConstructor,
      exportTypedArrayMethod: exportTypedArrayMethod,
      exportTypedArrayStaticMethod: exportTypedArrayStaticMethod,
      isView: isView,
      isTypedArray: isTypedArray,
      TypedArray: TypedArray,
      TypedArrayPrototype: TypedArrayPrototype
    };

    /* eslint-disable no-new */



    var NATIVE_ARRAY_BUFFER_VIEWS$1 = arrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;

    var ArrayBuffer$2 = global_1.ArrayBuffer;
    var Int8Array$2 = global_1.Int8Array;

    var typedArrayConstructorsRequireWrappers = !NATIVE_ARRAY_BUFFER_VIEWS$1 || !fails(function () {
      Int8Array$2(1);
    }) || !fails(function () {
      new Int8Array$2(-1);
    }) || !checkCorrectnessOfIteration(function (iterable) {
      new Int8Array$2();
      new Int8Array$2(null);
      new Int8Array$2(1.5);
      new Int8Array$2(iterable);
    }, true) || fails(function () {
      // Safari (11+) bug - a reason why even Safari 13 should load a typed array polyfill
      return new Int8Array$2(new ArrayBuffer$2(2), 1, undefined).length !== 1;
    });

    var toPositiveInteger = function (it) {
      var result = toInteger(it);
      if (result < 0) throw RangeError("The argument can't be less than 0");
      return result;
    };

    var toOffset = function (it, BYTES) {
      var offset = toPositiveInteger(it);
      if (offset % BYTES) throw RangeError('Wrong offset');
      return offset;
    };

    var aTypedArrayConstructor$1 = arrayBufferViewCore.aTypedArrayConstructor;

    var typedArrayFrom = function from(source /* , mapfn, thisArg */) {
      var O = toObject(source);
      var argumentsLength = arguments.length;
      var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
      var mapping = mapfn !== undefined;
      var iteratorMethod = getIteratorMethod(O);
      var i, length, result, step, iterator, next;
      if (iteratorMethod != undefined && !isArrayIteratorMethod(iteratorMethod)) {
        iterator = iteratorMethod.call(O);
        next = iterator.next;
        O = [];
        while (!(step = next.call(iterator)).done) {
          O.push(step.value);
        }
      }
      if (mapping && argumentsLength > 2) {
        mapfn = functionBindContext(mapfn, arguments[2], 2);
      }
      length = toLength(O.length);
      result = new (aTypedArrayConstructor$1(this))(length);
      for (i = 0; length > i; i++) {
        result[i] = mapping ? mapfn(O[i], i) : O[i];
      }
      return result;
    };

    // makes subclassing work correct for wrapped built-ins
    var inheritIfRequired = function ($this, dummy, Wrapper) {
      var NewTarget, NewTargetPrototype;
      if (
        // it can work only with native `setPrototypeOf`
        objectSetPrototypeOf &&
        // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
        typeof (NewTarget = dummy.constructor) == 'function' &&
        NewTarget !== Wrapper &&
        isObject(NewTargetPrototype = NewTarget.prototype) &&
        NewTargetPrototype !== Wrapper.prototype
      ) objectSetPrototypeOf($this, NewTargetPrototype);
      return $this;
    };

    var typedArrayConstructor = createCommonjsModule(function (module) {


















    var getOwnPropertyNames = objectGetOwnPropertyNames.f;

    var forEach = arrayIteration.forEach;






    var getInternalState = internalState.get;
    var setInternalState = internalState.set;
    var nativeDefineProperty = objectDefineProperty.f;
    var nativeGetOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
    var round = Math.round;
    var RangeError = global_1.RangeError;
    var ArrayBuffer = arrayBuffer.ArrayBuffer;
    var DataView = arrayBuffer.DataView;
    var NATIVE_ARRAY_BUFFER_VIEWS = arrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;
    var TYPED_ARRAY_TAG = arrayBufferViewCore.TYPED_ARRAY_TAG;
    var TypedArray = arrayBufferViewCore.TypedArray;
    var TypedArrayPrototype = arrayBufferViewCore.TypedArrayPrototype;
    var aTypedArrayConstructor = arrayBufferViewCore.aTypedArrayConstructor;
    var isTypedArray = arrayBufferViewCore.isTypedArray;
    var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
    var WRONG_LENGTH = 'Wrong length';

    var fromList = function (C, list) {
      var index = 0;
      var length = list.length;
      var result = new (aTypedArrayConstructor(C))(length);
      while (length > index) result[index] = list[index++];
      return result;
    };

    var addGetter = function (it, key) {
      nativeDefineProperty(it, key, { get: function () {
        return getInternalState(this)[key];
      } });
    };

    var isArrayBuffer = function (it) {
      var klass;
      return it instanceof ArrayBuffer || (klass = classof(it)) == 'ArrayBuffer' || klass == 'SharedArrayBuffer';
    };

    var isTypedArrayIndex = function (target, key) {
      return isTypedArray(target)
        && typeof key != 'symbol'
        && key in target
        && String(+key) == String(key);
    };

    var wrappedGetOwnPropertyDescriptor = function getOwnPropertyDescriptor(target, key) {
      return isTypedArrayIndex(target, key = toPrimitive(key, true))
        ? createPropertyDescriptor(2, target[key])
        : nativeGetOwnPropertyDescriptor(target, key);
    };

    var wrappedDefineProperty = function defineProperty(target, key, descriptor) {
      if (isTypedArrayIndex(target, key = toPrimitive(key, true))
        && isObject(descriptor)
        && has(descriptor, 'value')
        && !has(descriptor, 'get')
        && !has(descriptor, 'set')
        // TODO: add validation descriptor w/o calling accessors
        && !descriptor.configurable
        && (!has(descriptor, 'writable') || descriptor.writable)
        && (!has(descriptor, 'enumerable') || descriptor.enumerable)
      ) {
        target[key] = descriptor.value;
        return target;
      } return nativeDefineProperty(target, key, descriptor);
    };

    if (descriptors) {
      if (!NATIVE_ARRAY_BUFFER_VIEWS) {
        objectGetOwnPropertyDescriptor.f = wrappedGetOwnPropertyDescriptor;
        objectDefineProperty.f = wrappedDefineProperty;
        addGetter(TypedArrayPrototype, 'buffer');
        addGetter(TypedArrayPrototype, 'byteOffset');
        addGetter(TypedArrayPrototype, 'byteLength');
        addGetter(TypedArrayPrototype, 'length');
      }

      _export({ target: 'Object', stat: true, forced: !NATIVE_ARRAY_BUFFER_VIEWS }, {
        getOwnPropertyDescriptor: wrappedGetOwnPropertyDescriptor,
        defineProperty: wrappedDefineProperty
      });

      module.exports = function (TYPE, wrapper, CLAMPED) {
        var BYTES = TYPE.match(/\d+$/)[0] / 8;
        var CONSTRUCTOR_NAME = TYPE + (CLAMPED ? 'Clamped' : '') + 'Array';
        var GETTER = 'get' + TYPE;
        var SETTER = 'set' + TYPE;
        var NativeTypedArrayConstructor = global_1[CONSTRUCTOR_NAME];
        var TypedArrayConstructor = NativeTypedArrayConstructor;
        var TypedArrayConstructorPrototype = TypedArrayConstructor && TypedArrayConstructor.prototype;
        var exported = {};

        var getter = function (that, index) {
          var data = getInternalState(that);
          return data.view[GETTER](index * BYTES + data.byteOffset, true);
        };

        var setter = function (that, index, value) {
          var data = getInternalState(that);
          if (CLAMPED) value = (value = round(value)) < 0 ? 0 : value > 0xFF ? 0xFF : value & 0xFF;
          data.view[SETTER](index * BYTES + data.byteOffset, value, true);
        };

        var addElement = function (that, index) {
          nativeDefineProperty(that, index, {
            get: function () {
              return getter(this, index);
            },
            set: function (value) {
              return setter(this, index, value);
            },
            enumerable: true
          });
        };

        if (!NATIVE_ARRAY_BUFFER_VIEWS) {
          TypedArrayConstructor = wrapper(function (that, data, offset, $length) {
            anInstance(that, TypedArrayConstructor, CONSTRUCTOR_NAME);
            var index = 0;
            var byteOffset = 0;
            var buffer, byteLength, length;
            if (!isObject(data)) {
              length = toIndex(data);
              byteLength = length * BYTES;
              buffer = new ArrayBuffer(byteLength);
            } else if (isArrayBuffer(data)) {
              buffer = data;
              byteOffset = toOffset(offset, BYTES);
              var $len = data.byteLength;
              if ($length === undefined) {
                if ($len % BYTES) throw RangeError(WRONG_LENGTH);
                byteLength = $len - byteOffset;
                if (byteLength < 0) throw RangeError(WRONG_LENGTH);
              } else {
                byteLength = toLength($length) * BYTES;
                if (byteLength + byteOffset > $len) throw RangeError(WRONG_LENGTH);
              }
              length = byteLength / BYTES;
            } else if (isTypedArray(data)) {
              return fromList(TypedArrayConstructor, data);
            } else {
              return typedArrayFrom.call(TypedArrayConstructor, data);
            }
            setInternalState(that, {
              buffer: buffer,
              byteOffset: byteOffset,
              byteLength: byteLength,
              length: length,
              view: new DataView(buffer)
            });
            while (index < length) addElement(that, index++);
          });

          if (objectSetPrototypeOf) objectSetPrototypeOf(TypedArrayConstructor, TypedArray);
          TypedArrayConstructorPrototype = TypedArrayConstructor.prototype = objectCreate(TypedArrayPrototype);
        } else if (typedArrayConstructorsRequireWrappers) {
          TypedArrayConstructor = wrapper(function (dummy, data, typedArrayOffset, $length) {
            anInstance(dummy, TypedArrayConstructor, CONSTRUCTOR_NAME);
            return inheritIfRequired(function () {
              if (!isObject(data)) return new NativeTypedArrayConstructor(toIndex(data));
              if (isArrayBuffer(data)) return $length !== undefined
                ? new NativeTypedArrayConstructor(data, toOffset(typedArrayOffset, BYTES), $length)
                : typedArrayOffset !== undefined
                  ? new NativeTypedArrayConstructor(data, toOffset(typedArrayOffset, BYTES))
                  : new NativeTypedArrayConstructor(data);
              if (isTypedArray(data)) return fromList(TypedArrayConstructor, data);
              return typedArrayFrom.call(TypedArrayConstructor, data);
            }(), dummy, TypedArrayConstructor);
          });

          if (objectSetPrototypeOf) objectSetPrototypeOf(TypedArrayConstructor, TypedArray);
          forEach(getOwnPropertyNames(NativeTypedArrayConstructor), function (key) {
            if (!(key in TypedArrayConstructor)) {
              createNonEnumerableProperty(TypedArrayConstructor, key, NativeTypedArrayConstructor[key]);
            }
          });
          TypedArrayConstructor.prototype = TypedArrayConstructorPrototype;
        }

        if (TypedArrayConstructorPrototype.constructor !== TypedArrayConstructor) {
          createNonEnumerableProperty(TypedArrayConstructorPrototype, 'constructor', TypedArrayConstructor);
        }

        if (TYPED_ARRAY_TAG) {
          createNonEnumerableProperty(TypedArrayConstructorPrototype, TYPED_ARRAY_TAG, CONSTRUCTOR_NAME);
        }

        exported[CONSTRUCTOR_NAME] = TypedArrayConstructor;

        _export({
          global: true, forced: TypedArrayConstructor != NativeTypedArrayConstructor, sham: !NATIVE_ARRAY_BUFFER_VIEWS
        }, exported);

        if (!(BYTES_PER_ELEMENT in TypedArrayConstructor)) {
          createNonEnumerableProperty(TypedArrayConstructor, BYTES_PER_ELEMENT, BYTES);
        }

        if (!(BYTES_PER_ELEMENT in TypedArrayConstructorPrototype)) {
          createNonEnumerableProperty(TypedArrayConstructorPrototype, BYTES_PER_ELEMENT, BYTES);
        }

        setSpecies(CONSTRUCTOR_NAME);
      };
    } else module.exports = function () { /* empty */ };
    });

    // `Float32Array` constructor
    // https://tc39.github.io/ecma262/#sec-typedarray-objects
    typedArrayConstructor('Float32', function (init) {
      return function Float32Array(data, byteOffset, length) {
        return init(this, data, byteOffset, length);
      };
    });

    var min$3 = Math.min;

    // `Array.prototype.copyWithin` method implementation
    // https://tc39.github.io/ecma262/#sec-array.prototype.copywithin
    var arrayCopyWithin = [].copyWithin || function copyWithin(target /* = 0 */, start /* = 0, end = @length */) {
      var O = toObject(this);
      var len = toLength(O.length);
      var to = toAbsoluteIndex(target, len);
      var from = toAbsoluteIndex(start, len);
      var end = arguments.length > 2 ? arguments[2] : undefined;
      var count = min$3((end === undefined ? len : toAbsoluteIndex(end, len)) - from, len - to);
      var inc = 1;
      if (from < to && to < from + count) {
        inc = -1;
        from += count - 1;
        to += count - 1;
      }
      while (count-- > 0) {
        if (from in O) O[to] = O[from];
        else delete O[to];
        to += inc;
        from += inc;
      } return O;
    };

    var aTypedArray$1 = arrayBufferViewCore.aTypedArray;
    var exportTypedArrayMethod$1 = arrayBufferViewCore.exportTypedArrayMethod;

    // `%TypedArray%.prototype.copyWithin` method
    // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.copywithin
    exportTypedArrayMethod$1('copyWithin', function copyWithin(target, start /* , end */) {
      return arrayCopyWithin.call(aTypedArray$1(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
    });

    var $every = arrayIteration.every;

    var aTypedArray$2 = arrayBufferViewCore.aTypedArray;
    var exportTypedArrayMethod$2 = arrayBufferViewCore.exportTypedArrayMethod;

    // `%TypedArray%.prototype.every` method
    // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.every
    exportTypedArrayMethod$2('every', function every(callbackfn /* , thisArg */) {
      return $every(aTypedArray$2(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    });

    var aTypedArray$3 = arrayBufferViewCore.aTypedArray;
    var exportTypedArrayMethod$3 = arrayBufferViewCore.exportTypedArrayMethod;

    // `%TypedArray%.prototype.fill` method
    // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.fill
    // eslint-disable-next-line no-unused-vars
    exportTypedArrayMethod$3('fill', function fill(value /* , start, end */) {
      return arrayFill.apply(aTypedArray$3(this), arguments);
    });

    var $filter$1 = arrayIteration.filter;


    var aTypedArray$4 = arrayBufferViewCore.aTypedArray;
    var aTypedArrayConstructor$2 = arrayBufferViewCore.aTypedArrayConstructor;
    var exportTypedArrayMethod$4 = arrayBufferViewCore.exportTypedArrayMethod;

    // `%TypedArray%.prototype.filter` method
    // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.filter
    exportTypedArrayMethod$4('filter', function filter(callbackfn /* , thisArg */) {
      var list = $filter$1(aTypedArray$4(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
      var C = speciesConstructor(this, this.constructor);
      var index = 0;
      var length = list.length;
      var result = new (aTypedArrayConstructor$2(C))(length);
      while (length > index) result[index] = list[index++];
      return result;
    });

    var $find = arrayIteration.find;

    var aTypedArray$5 = arrayBufferViewCore.aTypedArray;
    var exportTypedArrayMethod$5 = arrayBufferViewCore.exportTypedArrayMethod;

    // `%TypedArray%.prototype.find` method
    // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.find
    exportTypedArrayMethod$5('find', function find(predicate /* , thisArg */) {
      return $find(aTypedArray$5(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
    });

    var $findIndex = arrayIteration.findIndex;

    var aTypedArray$6 = arrayBufferViewCore.aTypedArray;
    var exportTypedArrayMethod$6 = arrayBufferViewCore.exportTypedArrayMethod;

    // `%TypedArray%.prototype.findIndex` method
    // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.findindex
    exportTypedArrayMethod$6('findIndex', function findIndex(predicate /* , thisArg */) {
      return $findIndex(aTypedArray$6(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
    });

    var $forEach$1 = arrayIteration.forEach;

    var aTypedArray$7 = arrayBufferViewCore.aTypedArray;
    var exportTypedArrayMethod$7 = arrayBufferViewCore.exportTypedArrayMethod;

    // `%TypedArray%.prototype.forEach` method
    // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.foreach
    exportTypedArrayMethod$7('forEach', function forEach(callbackfn /* , thisArg */) {
      $forEach$1(aTypedArray$7(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    });

    var $includes = arrayIncludes.includes;

    var aTypedArray$8 = arrayBufferViewCore.aTypedArray;
    var exportTypedArrayMethod$8 = arrayBufferViewCore.exportTypedArrayMethod;

    // `%TypedArray%.prototype.includes` method
    // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.includes
    exportTypedArrayMethod$8('includes', function includes(searchElement /* , fromIndex */) {
      return $includes(aTypedArray$8(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
    });

    var $indexOf = arrayIncludes.indexOf;

    var aTypedArray$9 = arrayBufferViewCore.aTypedArray;
    var exportTypedArrayMethod$9 = arrayBufferViewCore.exportTypedArrayMethod;

    // `%TypedArray%.prototype.indexOf` method
    // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.indexof
    exportTypedArrayMethod$9('indexOf', function indexOf(searchElement /* , fromIndex */) {
      return $indexOf(aTypedArray$9(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
    });

    var ITERATOR$6 = wellKnownSymbol('iterator');
    var Uint8Array$1 = global_1.Uint8Array;
    var arrayValues = es_array_iterator.values;
    var arrayKeys = es_array_iterator.keys;
    var arrayEntries = es_array_iterator.entries;
    var aTypedArray$a = arrayBufferViewCore.aTypedArray;
    var exportTypedArrayMethod$a = arrayBufferViewCore.exportTypedArrayMethod;
    var nativeTypedArrayIterator = Uint8Array$1 && Uint8Array$1.prototype[ITERATOR$6];

    var CORRECT_ITER_NAME = !!nativeTypedArrayIterator
      && (nativeTypedArrayIterator.name == 'values' || nativeTypedArrayIterator.name == undefined);

    var typedArrayValues = function values() {
      return arrayValues.call(aTypedArray$a(this));
    };

    // `%TypedArray%.prototype.entries` method
    // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.entries
    exportTypedArrayMethod$a('entries', function entries() {
      return arrayEntries.call(aTypedArray$a(this));
    });
    // `%TypedArray%.prototype.keys` method
    // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.keys
    exportTypedArrayMethod$a('keys', function keys() {
      return arrayKeys.call(aTypedArray$a(this));
    });
    // `%TypedArray%.prototype.values` method
    // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.values
    exportTypedArrayMethod$a('values', typedArrayValues, !CORRECT_ITER_NAME);
    // `%TypedArray%.prototype[@@iterator]` method
    // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype-@@iterator
    exportTypedArrayMethod$a(ITERATOR$6, typedArrayValues, !CORRECT_ITER_NAME);

    var aTypedArray$b = arrayBufferViewCore.aTypedArray;
    var exportTypedArrayMethod$b = arrayBufferViewCore.exportTypedArrayMethod;
    var $join = [].join;

    // `%TypedArray%.prototype.join` method
    // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.join
    // eslint-disable-next-line no-unused-vars
    exportTypedArrayMethod$b('join', function join(separator) {
      return $join.apply(aTypedArray$b(this), arguments);
    });

    var min$4 = Math.min;
    var nativeLastIndexOf = [].lastIndexOf;
    var NEGATIVE_ZERO = !!nativeLastIndexOf && 1 / [1].lastIndexOf(1, -0) < 0;
    var STRICT_METHOD$3 = arrayMethodIsStrict('lastIndexOf');
    // For preventing possible almost infinite loop in non-standard implementations, test the forward version of the method
    var USES_TO_LENGTH$5 = arrayMethodUsesToLength('indexOf', { ACCESSORS: true, 1: 0 });
    var FORCED$3 = NEGATIVE_ZERO || !STRICT_METHOD$3 || !USES_TO_LENGTH$5;

    // `Array.prototype.lastIndexOf` method implementation
    // https://tc39.github.io/ecma262/#sec-array.prototype.lastindexof
    var arrayLastIndexOf = FORCED$3 ? function lastIndexOf(searchElement /* , fromIndex = @[*-1] */) {
      // convert -0 to +0
      if (NEGATIVE_ZERO) return nativeLastIndexOf.apply(this, arguments) || 0;
      var O = toIndexedObject(this);
      var length = toLength(O.length);
      var index = length - 1;
      if (arguments.length > 1) index = min$4(index, toInteger(arguments[1]));
      if (index < 0) index = length + index;
      for (;index >= 0; index--) if (index in O && O[index] === searchElement) return index || 0;
      return -1;
    } : nativeLastIndexOf;

    var aTypedArray$c = arrayBufferViewCore.aTypedArray;
    var exportTypedArrayMethod$c = arrayBufferViewCore.exportTypedArrayMethod;

    // `%TypedArray%.prototype.lastIndexOf` method
    // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.lastindexof
    // eslint-disable-next-line no-unused-vars
    exportTypedArrayMethod$c('lastIndexOf', function lastIndexOf(searchElement /* , fromIndex */) {
      return arrayLastIndexOf.apply(aTypedArray$c(this), arguments);
    });

    var $map$1 = arrayIteration.map;


    var aTypedArray$d = arrayBufferViewCore.aTypedArray;
    var aTypedArrayConstructor$3 = arrayBufferViewCore.aTypedArrayConstructor;
    var exportTypedArrayMethod$d = arrayBufferViewCore.exportTypedArrayMethod;

    // `%TypedArray%.prototype.map` method
    // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.map
    exportTypedArrayMethod$d('map', function map(mapfn /* , thisArg */) {
      return $map$1(aTypedArray$d(this), mapfn, arguments.length > 1 ? arguments[1] : undefined, function (O, length) {
        return new (aTypedArrayConstructor$3(speciesConstructor(O, O.constructor)))(length);
      });
    });

    var $reduce$1 = arrayReduce.left;

    var aTypedArray$e = arrayBufferViewCore.aTypedArray;
    var exportTypedArrayMethod$e = arrayBufferViewCore.exportTypedArrayMethod;

    // `%TypedArray%.prototype.reduce` method
    // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.reduce
    exportTypedArrayMethod$e('reduce', function reduce(callbackfn /* , initialValue */) {
      return $reduce$1(aTypedArray$e(this), callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
    });

    var $reduceRight = arrayReduce.right;

    var aTypedArray$f = arrayBufferViewCore.aTypedArray;
    var exportTypedArrayMethod$f = arrayBufferViewCore.exportTypedArrayMethod;

    // `%TypedArray%.prototype.reduceRicht` method
    // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.reduceright
    exportTypedArrayMethod$f('reduceRight', function reduceRight(callbackfn /* , initialValue */) {
      return $reduceRight(aTypedArray$f(this), callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
    });

    var aTypedArray$g = arrayBufferViewCore.aTypedArray;
    var exportTypedArrayMethod$g = arrayBufferViewCore.exportTypedArrayMethod;
    var floor$2 = Math.floor;

    // `%TypedArray%.prototype.reverse` method
    // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.reverse
    exportTypedArrayMethod$g('reverse', function reverse() {
      var that = this;
      var length = aTypedArray$g(that).length;
      var middle = floor$2(length / 2);
      var index = 0;
      var value;
      while (index < middle) {
        value = that[index];
        that[index++] = that[--length];
        that[length] = value;
      } return that;
    });

    var aTypedArray$h = arrayBufferViewCore.aTypedArray;
    var exportTypedArrayMethod$h = arrayBufferViewCore.exportTypedArrayMethod;

    var FORCED$4 = fails(function () {
      // eslint-disable-next-line no-undef
      new Int8Array(1).set({});
    });

    // `%TypedArray%.prototype.set` method
    // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.set
    exportTypedArrayMethod$h('set', function set(arrayLike /* , offset */) {
      aTypedArray$h(this);
      var offset = toOffset(arguments.length > 1 ? arguments[1] : undefined, 1);
      var length = this.length;
      var src = toObject(arrayLike);
      var len = toLength(src.length);
      var index = 0;
      if (len + offset > length) throw RangeError('Wrong length');
      while (index < len) this[offset + index] = src[index++];
    }, FORCED$4);

    var aTypedArray$i = arrayBufferViewCore.aTypedArray;
    var aTypedArrayConstructor$4 = arrayBufferViewCore.aTypedArrayConstructor;
    var exportTypedArrayMethod$i = arrayBufferViewCore.exportTypedArrayMethod;
    var $slice = [].slice;

    var FORCED$5 = fails(function () {
      // eslint-disable-next-line no-undef
      new Int8Array(1).slice();
    });

    // `%TypedArray%.prototype.slice` method
    // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.slice
    exportTypedArrayMethod$i('slice', function slice(start, end) {
      var list = $slice.call(aTypedArray$i(this), start, end);
      var C = speciesConstructor(this, this.constructor);
      var index = 0;
      var length = list.length;
      var result = new (aTypedArrayConstructor$4(C))(length);
      while (length > index) result[index] = list[index++];
      return result;
    }, FORCED$5);

    var $some = arrayIteration.some;

    var aTypedArray$j = arrayBufferViewCore.aTypedArray;
    var exportTypedArrayMethod$j = arrayBufferViewCore.exportTypedArrayMethod;

    // `%TypedArray%.prototype.some` method
    // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.some
    exportTypedArrayMethod$j('some', function some(callbackfn /* , thisArg */) {
      return $some(aTypedArray$j(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    });

    var aTypedArray$k = arrayBufferViewCore.aTypedArray;
    var exportTypedArrayMethod$k = arrayBufferViewCore.exportTypedArrayMethod;
    var $sort = [].sort;

    // `%TypedArray%.prototype.sort` method
    // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.sort
    exportTypedArrayMethod$k('sort', function sort(comparefn) {
      return $sort.call(aTypedArray$k(this), comparefn);
    });

    var aTypedArray$l = arrayBufferViewCore.aTypedArray;
    var exportTypedArrayMethod$l = arrayBufferViewCore.exportTypedArrayMethod;

    // `%TypedArray%.prototype.subarray` method
    // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.subarray
    exportTypedArrayMethod$l('subarray', function subarray(begin, end) {
      var O = aTypedArray$l(this);
      var length = O.length;
      var beginIndex = toAbsoluteIndex(begin, length);
      return new (speciesConstructor(O, O.constructor))(
        O.buffer,
        O.byteOffset + beginIndex * O.BYTES_PER_ELEMENT,
        toLength((end === undefined ? length : toAbsoluteIndex(end, length)) - beginIndex)
      );
    });

    var Int8Array$3 = global_1.Int8Array;
    var aTypedArray$m = arrayBufferViewCore.aTypedArray;
    var exportTypedArrayMethod$m = arrayBufferViewCore.exportTypedArrayMethod;
    var $toLocaleString = [].toLocaleString;
    var $slice$1 = [].slice;

    // iOS Safari 6.x fails here
    var TO_LOCALE_STRING_BUG = !!Int8Array$3 && fails(function () {
      $toLocaleString.call(new Int8Array$3(1));
    });

    var FORCED$6 = fails(function () {
      return [1, 2].toLocaleString() != new Int8Array$3([1, 2]).toLocaleString();
    }) || !fails(function () {
      Int8Array$3.prototype.toLocaleString.call([1, 2]);
    });

    // `%TypedArray%.prototype.toLocaleString` method
    // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.tolocalestring
    exportTypedArrayMethod$m('toLocaleString', function toLocaleString() {
      return $toLocaleString.apply(TO_LOCALE_STRING_BUG ? $slice$1.call(aTypedArray$m(this)) : aTypedArray$m(this), arguments);
    }, FORCED$6);

    var exportTypedArrayMethod$n = arrayBufferViewCore.exportTypedArrayMethod;



    var Uint8Array$2 = global_1.Uint8Array;
    var Uint8ArrayPrototype = Uint8Array$2 && Uint8Array$2.prototype || {};
    var arrayToString = [].toString;
    var arrayJoin = [].join;

    if (fails(function () { arrayToString.call({}); })) {
      arrayToString = function toString() {
        return arrayJoin.call(this);
      };
    }

    var IS_NOT_ARRAY_METHOD = Uint8ArrayPrototype.toString != arrayToString;

    // `%TypedArray%.prototype.toString` method
    // https://tc39.github.io/ecma262/#sec-%typedarray%.prototype.tostring
    exportTypedArrayMethod$n('toString', arrayToString, IS_NOT_ARRAY_METHOD);

    var AhdsrEnvelope = /*#__PURE__*/function () {
      function AhdsrEnvelope(ctx, gain, envelope) {
        _classCallCheck(this, AhdsrEnvelope);

        _defineProperty(this, "ctx", void 0);

        _defineProperty(this, "gain", void 0);

        _defineProperty(this, "envelope", void 0);

        _defineProperty(this, "attackNode", void 0);

        _defineProperty(this, "decayNode", void 0);

        _defineProperty(this, "releaseNode", void 0);

        _defineProperty(this, "input", void 0);

        this.ctx = ctx;
        this.gain = gain;
        this.envelope = envelope;
        this.attackNode = ctx.createGain();
        this.decayNode = ctx.createGain();
        this.releaseNode = ctx.createGain();
        this.attackNode.gain.value = 0;
        this.decayNode.gain.value = 1;
        this.releaseNode.gain.value = 1;
        this.attackNode.connect(this.decayNode);
        this.decayNode.connect(this.releaseNode);
        this.input = this.attackNode;
      }

      _createClass(AhdsrEnvelope, [{
        key: "connect",
        value: function connect(destinationNode, output, input) {
          if (destinationNode instanceof AudioParam) {
            this.releaseNode.connect(destinationNode, output);
          } else {
            this.releaseNode.connect(destinationNode, output, input);
          }

          return this;
        }
      }, {
        key: "schedule",
        value: function schedule(volume, startTime, releaseTime) {
          this.attackNode.gain.setValueAtTime(0, startTime);
          this.attackNode.gain.linearRampToValueAtTime(this.gain * volume, this.ctx.currentTime + startTime + this.envelope.attack);
          this.decayNode.gain.setTargetAtTime(this.gain * volume * this.envelope.sustain, this.ctx.currentTime + startTime + this.envelope.attack + this.envelope.hold, this.envelope.decay);
          this.releaseNode.gain.setTargetAtTime(0, this.ctx.currentTime + releaseTime, this.envelope.release);
          return this;
        }
      }]);

      return AhdsrEnvelope;
    }();
    var AhdEnvelope = /*#__PURE__*/function () {
      function AhdEnvelope(ctx, gain, envelope) {
        _classCallCheck(this, AhdEnvelope);

        _defineProperty(this, "ctx", void 0);

        _defineProperty(this, "gain", void 0);

        _defineProperty(this, "envelope", void 0);

        _defineProperty(this, "attackNode", void 0);

        _defineProperty(this, "decayNode", void 0);

        _defineProperty(this, "input", void 0);

        this.ctx = ctx;
        this.gain = gain;
        this.envelope = envelope;
        this.attackNode = ctx.createGain();
        this.decayNode = ctx.createGain();
        this.attackNode.gain.value = 0;
        this.decayNode.gain.value = 1;
        this.attackNode.connect(this.decayNode);
        this.input = this.attackNode;
      }

      _createClass(AhdEnvelope, [{
        key: "connect",
        value: function connect(destinationNode, output, input) {
          if (destinationNode instanceof AudioParam) {
            this.decayNode.connect(destinationNode, output);
          } else {
            this.decayNode.connect(destinationNode, output, input);
          }

          return this;
        }
      }, {
        key: "schedule",
        value: function schedule(volume, startTime) {
          this.attackNode.gain.setValueAtTime(0, startTime);
          this.attackNode.gain.linearRampToValueAtTime(this.gain * volume, this.ctx.currentTime + startTime + this.envelope.attack);
          this.decayNode.gain.setTargetAtTime(0, this.ctx.currentTime + startTime + this.envelope.attack + this.envelope.hold, this.envelope.decay);
          return this;
        }
      }]);

      return AhdEnvelope;
    }();

    var InstrumentSynth = /*#__PURE__*/function () {
      function InstrumentSynth() {
        _classCallCheck(this, InstrumentSynth);

        _defineProperty(this, "instrument", void 0);
      }

      _createClass(InstrumentSynth, [{
        key: "schedule",
        value: function () {
          var _schedule = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(ctx, destination, notes) {
            var _this = this;

            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _context.next = 2;
                    return this.setup(ctx, destination);

                  case 2:
                    notes[this.instrument].forEach(function (note) {
                      return _this.loadNote(note, ctx, destination);
                    });

                  case 3:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee, this);
          }));

          function schedule(_x, _x2, _x3) {
            return _schedule.apply(this, arguments);
          }

          return schedule;
        }()
      }]);

      return InstrumentSynth;
    }();

    var A4 = 440;
    function toFrequency(pitch) {
      return A4 * Math.pow(2, (pitch - 69) / 12);
    }

    var OFFSET = 0.012;
    var Piano = /*#__PURE__*/function (_InstrumentSynth) {
      _inherits(Piano, _InstrumentSynth);

      var _super = _createSuper(Piano);

      function Piano() {
        var _this;

        _classCallCheck(this, Piano);

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        _this = _super.call.apply(_super, [this].concat(args));

        _defineProperty(_assertThisInitialized(_this), "instrument", "piano");

        return _this;
      }

      _createClass(Piano, [{
        key: "setup",
        value: function () {
          var _setup = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(ctx, destination) {
            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee);
          }));

          function setup(_x, _x2) {
            return _setup.apply(this, arguments);
          }

          return setup;
        }()
      }, {
        key: "loadNote",
        value: function () {
          var _loadNote = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(note, ctx, destination) {
            var node;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    node = new PianoNode(ctx);
                    node.frequencyParam.value = toFrequency(note.pitch);
                    node.connect(destination);
                    node.schedule(note);

                  case 4:
                  case "end":
                    return _context2.stop();
                }
              }
            }, _callee2);
          }));

          function loadNote(_x3, _x4, _x5) {
            return _loadNote.apply(this, arguments);
          }

          return loadNote;
        }()
      }]);

      return Piano;
    }(InstrumentSynth);

    var PianoNode = /*#__PURE__*/function () {
      function PianoNode(ctx) {
        _classCallCheck(this, PianoNode);

        _defineProperty(this, "idealFrequency", void 0);

        _defineProperty(this, "frequencyParam", void 0);

        _defineProperty(this, "lowFrequency", void 0);

        _defineProperty(this, "midFrequency", void 0);

        _defineProperty(this, "highFrequency", void 0);

        _defineProperty(this, "lowTricord", void 0);

        _defineProperty(this, "midTricord", void 0);

        _defineProperty(this, "highTricord", void 0);

        _defineProperty(this, "hammer", void 0);

        _defineProperty(this, "lowpass", void 0);

        _defineProperty(this, "lowpassEnvelope", void 0);

        _defineProperty(this, "output", void 0);

        this.idealFrequency = ctx.createConstantSource();
        this.frequencyParam = this.idealFrequency.offset;
        this.midFrequency = ctx.createGain();
        this.midFrequency.gain.value = PianoNode.DETUNE;
        this.idealFrequency.connect(this.midFrequency);
        this.lowFrequency = ctx.createGain();
        this.lowFrequency.gain.value = PianoNode.LOW_FREQ_MULT;
        this.midFrequency.connect(this.lowFrequency);
        this.highFrequency = ctx.createGain();
        this.highFrequency.gain.value = PianoNode.HIGH_FREQ_MULT;
        this.midFrequency.connect(this.highFrequency);
        this.lowTricord = new TricordNode(ctx);
        this.midTricord = new TricordNode(ctx);
        this.highTricord = new TricordNode(ctx);
        this.lowFrequency.connect(this.lowTricord.frequencyParam);
        this.midFrequency.connect(this.midTricord.frequencyParam);
        this.highFrequency.connect(this.highTricord.frequencyParam);
        this.lowpass = ctx.createBiquadFilter();
        this.lowpass.type = "lowpass";
        this.lowpassEnvelope = new AhdEnvelope(ctx, 30, PianoNode.LOW_PASS_ENVELOPE);
        this.midFrequency.connect(this.lowpassEnvelope.input);
        this.lowpassEnvelope.connect(this.lowpass.frequency);
        this.lowTricord.connect(this.lowpass);
        this.midTricord.connect(this.lowpass);
        this.highTricord.connect(this.lowpass);
        this.hammer = new HammerNode(ctx);
        this.midFrequency.connect(this.hammer.frequencyParam);
        this.output = ctx.createGain();
        this.output.gain.value = PianoNode.VOLUME;
        this.lowpass.connect(this.output);
        this.hammer.connect(this.output);
      }

      _createClass(PianoNode, [{
        key: "connect",
        value: function connect(destinationNode, output, input) {
          if (destinationNode instanceof AudioParam) {
            this.output.connect(destinationNode, output);
          } else {
            this.output.connect(destinationNode, output, input);
          }

          return this;
        }
      }, {
        key: "schedule",
        value: function schedule(note) {
          this.idealFrequency.start(note.startTime + OFFSET);
          this.lowpassEnvelope.schedule(note.volume, note.startTime + OFFSET);

          var adjustedNote = _objectSpread2(_objectSpread2({}, note), {}, {
            startTime: note.startTime + OFFSET
          });

          var stopTime1 = this.lowTricord.schedule(adjustedNote);
          var stopTime2 = this.midTricord.schedule(adjustedNote);
          var stopTime3 = this.highTricord.schedule(adjustedNote);
          var stopTime4 = this.hammer.schedule(adjustedNote);
          var stopTime = Math.max(stopTime1, stopTime2, stopTime3, stopTime4);
          this.idealFrequency.stop(stopTime);
        }
      }]);

      return PianoNode;
    }();

    _defineProperty(PianoNode, "VOLUME", 0.2);

    _defineProperty(PianoNode, "DETUNE", 1.003);

    _defineProperty(PianoNode, "LOW_FREQ_MULT", 0.9997);

    _defineProperty(PianoNode, "HIGH_FREQ_MULT", 1.0008);

    _defineProperty(PianoNode, "LOW_PASS_ENVELOPE", {
      attack: 0,
      hold: 0.01,
      decay: 0.5
    });

    var TricordNode = /*#__PURE__*/function () {
      function TricordNode(ctx) {
        _classCallCheck(this, TricordNode);

        _defineProperty(this, "fundamentalFrequency", void 0);

        _defineProperty(this, "frequencyParam", void 0);

        _defineProperty(this, "fundamentalOscillator", void 0);

        _defineProperty(this, "fundamentalEnvelope", void 0);

        _defineProperty(this, "harmonicOscillator", void 0);

        _defineProperty(this, "harmonicEnvelope", void 0);

        this.fundamentalFrequency = ctx.createConstantSource();
        this.frequencyParam = this.fundamentalFrequency.offset;
        this.fundamentalOscillator = ctx.createOscillator();
        this.fundamentalOscillator.frequency.value = 0;
        this.fundamentalFrequency.connect(this.fundamentalOscillator.frequency);
        this.fundamentalEnvelope = new AhdsrEnvelope(ctx, TricordNode.FUNDAMENTAL_VOLUME, TricordNode.FUNDAMENTAL_ENVELOPE);
        this.fundamentalOscillator.connect(this.fundamentalEnvelope.input);
        this.harmonicOscillator = ctx.createOscillator();
        this.harmonicOscillator.frequency.value = 0;
        this.fundamentalFrequency.connect(this.harmonicOscillator.frequency);
        var real = new Float32Array(15);
        var imag = new Float32Array(15);
        real.fill(1);
        imag.fill(0);
        real[0] = 0;
        var harmonicWave = ctx.createPeriodicWave(real, imag);
        this.harmonicOscillator.setPeriodicWave(harmonicWave);
        this.harmonicEnvelope = new AhdsrEnvelope(ctx, TricordNode.HARMONIC_VOLUME, TricordNode.HARMONIC_ENVELOPE);
        this.harmonicOscillator.connect(this.harmonicEnvelope.input);
      }

      _createClass(TricordNode, [{
        key: "connect",
        value: function connect(destinationNode, output, input) {
          if (destinationNode instanceof AudioParam) {
            this.fundamentalEnvelope.connect(destinationNode, output);
            this.harmonicEnvelope.connect(destinationNode, output);
          } else {
            this.fundamentalEnvelope.connect(destinationNode, output, input);
            this.harmonicEnvelope.connect(destinationNode, output, input);
          }

          return this;
        }
      }, {
        key: "schedule",
        value: function schedule(_ref) {
          var startTime = _ref.startTime,
              releaseTime = _ref.endTime,
              volume = _ref.volume;
          var fundamentalStopTime = releaseTime + AFTER_RELEASE * TricordNode.FUNDAMENTAL_ENVELOPE.release;
          this.fundamentalFrequency.start(startTime);
          this.fundamentalFrequency.stop(fundamentalStopTime);
          this.fundamentalOscillator.start(startTime);
          this.fundamentalOscillator.stop(fundamentalStopTime);
          this.fundamentalEnvelope.schedule(volume, startTime, releaseTime);
          var harmonicStopTime = releaseTime + AFTER_RELEASE * TricordNode.HARMONIC_ENVELOPE.release;
          this.harmonicOscillator.start(startTime);
          this.harmonicOscillator.stop(harmonicStopTime);
          this.harmonicEnvelope.schedule(volume, startTime, releaseTime);
          return Math.max(fundamentalStopTime, harmonicStopTime);
        }
      }]);

      return TricordNode;
    }();

    _defineProperty(TricordNode, "FUNDAMENTAL_VOLUME", 0.2);

    _defineProperty(TricordNode, "HARMONIC_VOLUME", 0.1);

    _defineProperty(TricordNode, "FUNDAMENTAL_ENVELOPE", {
      attack: 0.001,
      hold: 0.01,
      decay: 2,
      sustain: 0,
      release: 0.4
    });

    _defineProperty(TricordNode, "HARMONIC_ENVELOPE", {
      attack: 0.003,
      hold: 0,
      decay: 1.8,
      sustain: 0,
      release: 0.2
    });

    var HammerNode = /*#__PURE__*/function () {
      function HammerNode(ctx) {
        _classCallCheck(this, HammerNode);

        _defineProperty(this, "frequency", void 0);

        _defineProperty(this, "frequencyParam", void 0);

        _defineProperty(this, "oscillator", void 0);

        _defineProperty(this, "oscillatorFrequency", void 0);

        _defineProperty(this, "envelope", void 0);

        this.frequency = ctx.createConstantSource();
        this.frequencyParam = this.frequency.offset;
        this.oscillator = ctx.createOscillator();
        this.oscillator.type = "sawtooth";
        this.oscillator.frequency.value = 0;
        this.oscillatorFrequency = ctx.createGain();
        this.oscillatorFrequency.gain.value = HammerNode.DETUNE;
        this.oscillatorFrequency.connect(this.oscillator.frequency);
        this.frequency.connect(this.oscillatorFrequency);
        this.envelope = new AhdEnvelope(ctx, HammerNode.VOLUME, HammerNode.ENVELOPE);
        this.oscillator.connect(this.envelope.input);
      }

      _createClass(HammerNode, [{
        key: "connect",
        value: function connect(destinationNode, output, input) {
          if (destinationNode instanceof AudioParam) {
            this.envelope.connect(destinationNode, output);
          } else {
            this.envelope.connect(destinationNode, output, input);
          }

          return this;
        }
      }, {
        key: "schedule",
        value: function schedule(_ref2) {
          var startTime = _ref2.startTime,
              volume = _ref2.volume;
          var stopTime = startTime + HammerNode.ENVELOPE.hold + AFTER_RELEASE * HammerNode.ENVELOPE.decay;
          this.frequency.start(startTime);
          this.frequency.stop(stopTime);
          this.oscillator.start(startTime);
          this.oscillator.stop(stopTime);
          this.envelope.schedule(volume, startTime);
          return stopTime;
        }
      }]);

      return HammerNode;
    }();

    _defineProperty(HammerNode, "VOLUME", 0.15);

    _defineProperty(HammerNode, "ENVELOPE", {
      attack: 0,
      hold: 0.002,
      decay: 0.1
    });

    _defineProperty(HammerNode, "DETUNE", 1);

    var test$1 = [];
    var nativeSort = test$1.sort;

    // IE8-
    var FAILS_ON_UNDEFINED = fails(function () {
      test$1.sort(undefined);
    });
    // V8 bug
    var FAILS_ON_NULL = fails(function () {
      test$1.sort(null);
    });
    // Old WebKit
    var STRICT_METHOD$4 = arrayMethodIsStrict('sort');

    var FORCED$7 = FAILS_ON_UNDEFINED || !FAILS_ON_NULL || !STRICT_METHOD$4;

    // `Array.prototype.sort` method
    // https://tc39.github.io/ecma262/#sec-array.prototype.sort
    _export({ target: 'Array', proto: true, forced: FORCED$7 }, {
      sort: function sort(comparefn) {
        return comparefn === undefined
          ? nativeSort.call(toObject(this))
          : nativeSort.call(toObject(this), aFunction$1(comparefn));
      }
    });

    var $entries = objectToArray.entries;

    // `Object.entries` method
    // https://tc39.github.io/ecma262/#sec-object.entries
    _export({ target: 'Object', stat: true }, {
      entries: function entries(O) {
        return $entries(O);
      }
    });

    function decode(encoded) {
      var notes = {
        piano: [],
        violin: [],
        cello: [],
        bass: [],
        guitar: [],
        flute: [],
        clarinet: [],
        trumpet: [],
        harp: [],
        drums: []
      };
      var notesStarted = {
        piano: {},
        violin: {},
        cello: {},
        bass: {},
        guitar: {},
        flute: {},
        clarinet: {},
        trumpet: {},
        harp: {},
        drums: {}
      };
      var time = 0;
      var tokens = encoded.map(parseToken).filter(function (it) {
        return it !== null;
      });
      tokens.forEach(function (token) {
        if (token.type === "note") {
          var instrument = token.instrument,
              pitch = token.pitch;
          var instrumentNotes = notes[instrument];

          if (token.volume === 0) {
            var start = notesStarted[instrument][pitch];

            if (start !== undefined) {
              var startTime = start.startTime,
                  volume = start.volume;
              instrumentNotes.push({
                startTime: startTime,
                endTime: time,
                pitch: pitch,
                volume: volume / 80
              }); // console.log("Adding", startTime, time, pitch);

              delete notesStarted[instrument][pitch];
            }
          } else {
            var previous = notesStarted[instrument][pitch];

            if (previous !== undefined) {
              var _startTime = previous.startTime,
                  _volume = previous.volume;
              instrumentNotes.push({
                startTime: _startTime,
                endTime: time,
                pitch: pitch,
                volume: _volume / 80
              }); // console.log("Adding Prematurely", startTime, time, pitch);
            }

            notesStarted[instrument][pitch] = {
              startTime: time,
              volume: token.volume
            };
          }
        } else if (token.type == "wait") {
          var delay = token.delay;
          var factor = 6 / 625;
          var seconds = delay * factor;
          time += seconds;
        }
      });
      Object.entries(notesStarted).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            instrument = _ref2[0],
            started = _ref2[1];

        return Object.entries(started).forEach(function (_ref3) {
          var _ref4 = _slicedToArray(_ref3, 2),
              pitch = _ref4[0],
              _ref4$ = _ref4[1],
              startTime = _ref4$.startTime,
              volume = _ref4$.volume;

          return notes[instrument].push({
            pitch: parseInt(pitch),
            startTime: startTime,
            endTime: time,
            volume: volume / 80
          });
        });
      });
      Object.values(notes).forEach(function (instrumentNotes) {
        return instrumentNotes.sort(function (a, b) {
          return a.startTime - b.startTime;
        });
      });
      return notes;
    }
    var tokenInfo = [["piano", 0], ["piano", 24], ["piano", 32], ["piano", 40], ["piano", 48], ["piano", 56], ["piano", 64], ["piano", 72], ["piano", 80], ["piano", 88], ["piano", 96], ["piano", 104], ["piano", 112], ["piano", 120], ["violin", 80], ["violin", 0], ["cello", 80], ["cello", 0], ["bass", 80], ["bass", 0], ["guitar", 80], ["guitar", 0], ["flute", 80], ["flute", 0], ["clarinet", 80], ["clarinet", 0], ["trumpet", 80], ["trumpet", 0], ["harp", 80], ["harp", 0]];
    function parseToken(token) {
      if (token >= 0 && token < 3840) {
        var _tokenInfo = _slicedToArray(tokenInfo[token >> 7], 2),
            instrument = _tokenInfo[0],
            volume = _tokenInfo[1];

        return {
          type: "note",
          pitch: token % 128,
          instrument: instrument,
          volume: volume
        };
      }

      if (token < 3968) return {
        type: "note",
        pitch: token % 128,
        instrument: "drums",
        volume: 80
      };
      if (token < 4096) return {
        type: "wait",
        delay: token % 128 + 1
      };
      return null;
    }

    var FmSynth = /*#__PURE__*/function (_InstrumentSynth) {
      _inherits(FmSynth, _InstrumentSynth);

      var _super = _createSuper(FmSynth);

      function FmSynth() {
        var _this;

        _classCallCheck(this, FmSynth);

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        _this = _super.call.apply(_super, [this].concat(args));

        _defineProperty(_assertThisInitialized(_this), "amplitudeGain", void 0);

        _defineProperty(_assertThisInitialized(_this), "amplitudeWave", void 0);

        _defineProperty(_assertThisInitialized(_this), "amplitudeEnvelope", void 0);

        _defineProperty(_assertThisInitialized(_this), "amplitudeFrequencyMultiplier", 1);

        _defineProperty(_assertThisInitialized(_this), "frequencyGain", void 0);

        _defineProperty(_assertThisInitialized(_this), "frequencyWave", void 0);

        _defineProperty(_assertThisInitialized(_this), "frequencyEnvelope", void 0);

        _defineProperty(_assertThisInitialized(_this), "frequencyFrequencyMultiplier", 1);

        return _this;
      }

      _createClass(FmSynth, [{
        key: "setup",
        value: function () {
          var _setup = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee);
          }));

          function setup() {
            return _setup.apply(this, arguments);
          }

          return setup;
        }()
      }, {
        key: "loadNote",
        value: function () {
          var _loadNote = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(note, ctx, destination) {
            var freq, adjustedAmplitudeEnvelope, ampOsc, ampGain, adjustedFrequencyEnvelope, freqOsc, freqGain;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    freq = toFrequency(note.pitch);
                    adjustedAmplitudeEnvelope = {
                      attack: this.amplitudeEnvelope.attack,
                      hold: this.amplitudeEnvelope.hold,
                      decay: this.amplitudeEnvelope.decay,
                      sustain: this.amplitudeEnvelope.sustain,
                      release: this.amplitudeEnvelope.release
                    };
                    ampOsc = ctx.createOscillator();
                    ampOsc.type = this.amplitudeWave;
                    ampOsc.frequency.value = freq * this.amplitudeFrequencyMultiplier;
                    ampOsc.start(note.startTime);
                    ampOsc.stop(note.endTime + AFTER_RELEASE * this.amplitudeEnvelope.release);
                    ampGain = new AhdsrEnvelope(ctx, this.amplitudeGain * note.volume, adjustedAmplitudeEnvelope);
                    ampOsc.connect(ampGain.input);
                    ampGain.connect(destination);
                    ampGain.schedule(note.volume, note.startTime, note.endTime);
                    adjustedFrequencyEnvelope = {
                      attack: this.frequencyEnvelope.attack,
                      hold: this.frequencyEnvelope.hold,
                      decay: this.frequencyEnvelope.decay,
                      sustain: this.frequencyEnvelope.sustain,
                      release: this.frequencyEnvelope.release
                    };
                    freqOsc = ctx.createOscillator();
                    freqOsc.type = this.frequencyWave;
                    freqOsc.frequency.value = freq * this.frequencyFrequencyMultiplier;
                    freqOsc.start(note.startTime);
                    freqOsc.stop(note.endTime + AFTER_RELEASE * this.frequencyEnvelope.release);
                    freqGain = new AhdsrEnvelope(ctx, this.frequencyGain, adjustedFrequencyEnvelope);
                    freqOsc.connect(freqGain.input);
                    freqGain.connect(ampOsc.frequency);
                    freqGain.schedule(note.volume, note.startTime, note.endTime);

                  case 21:
                  case "end":
                    return _context2.stop();
                }
              }
            }, _callee2, this);
          }));

          function loadNote(_x, _x2, _x3) {
            return _loadNote.apply(this, arguments);
          }

          return loadNote;
        }()
      }]);

      return FmSynth;
    }(InstrumentSynth);

    var Bass = /*#__PURE__*/function (_FmSynth) {
      _inherits(Bass, _FmSynth);

      var _super = _createSuper(Bass);

      function Bass() {
        var _this;

        _classCallCheck(this, Bass);

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        _this = _super.call.apply(_super, [this].concat(args));

        _defineProperty(_assertThisInitialized(_this), "instrument", "bass");

        _defineProperty(_assertThisInitialized(_this), "amplitudeEnvelope", {
          attack: 0.001,
          hold: 0.01,
          decay: 0.3,
          sustain: 0,
          release: 0.05
        });

        _defineProperty(_assertThisInitialized(_this), "amplitudeGain", 0.5);

        _defineProperty(_assertThisInitialized(_this), "amplitudeWave", "sine");

        _defineProperty(_assertThisInitialized(_this), "amplitudeFrequencyMultiplier", 0.5);

        _defineProperty(_assertThisInitialized(_this), "frequencyEnvelope", {
          attack: 0.001,
          hold: 0.01,
          decay: 1,
          sustain: 1,
          release: 0.05
        });

        _defineProperty(_assertThisInitialized(_this), "frequencyGain", 3);

        _defineProperty(_assertThisInitialized(_this), "frequencyWave", "sine");

        _defineProperty(_assertThisInitialized(_this), "frequencyFrequencyMultiplier", 3);

        return _this;
      }

      return Bass;
    }(FmSynth);

    var Clarinet = /*#__PURE__*/function (_FmSynth) {
      _inherits(Clarinet, _FmSynth);

      var _super = _createSuper(Clarinet);

      function Clarinet() {
        var _this;

        _classCallCheck(this, Clarinet);

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        _this = _super.call.apply(_super, [this].concat(args));

        _defineProperty(_assertThisInitialized(_this), "instrument", "clarinet");

        _defineProperty(_assertThisInitialized(_this), "amplitudeEnvelope", {
          attack: 0.05,
          hold: 0.01,
          decay: 0.1,
          sustain: 0.8,
          release: 0.05
        });

        _defineProperty(_assertThisInitialized(_this), "amplitudeGain", 0.1);

        _defineProperty(_assertThisInitialized(_this), "amplitudeWave", "square");

        _defineProperty(_assertThisInitialized(_this), "amplitudePitchAdjustment", null);

        _defineProperty(_assertThisInitialized(_this), "amplitudeFrequencyMultiplier", 1);

        _defineProperty(_assertThisInitialized(_this), "frequencyEnvelope", {
          attack: 0.001,
          hold: 0.01,
          decay: 0.1,
          sustain: 1.1,
          release: 0.05
        });

        _defineProperty(_assertThisInitialized(_this), "frequencyGain", 4);

        _defineProperty(_assertThisInitialized(_this), "frequencyWave", "square");

        _defineProperty(_assertThisInitialized(_this), "frequencyPitchAdjustment", null);

        _defineProperty(_assertThisInitialized(_this), "frequencyFrequencyMultiplier", 1);

        _defineProperty(_assertThisInitialized(_this), "offDelay", 0.25);

        return _this;
      }

      return Clarinet;
    }(FmSynth);

    var Cello = /*#__PURE__*/function (_FmSynth) {
      _inherits(Cello, _FmSynth);

      var _super = _createSuper(Cello);

      function Cello() {
        var _this;

        _classCallCheck(this, Cello);

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        _this = _super.call.apply(_super, [this].concat(args));

        _defineProperty(_assertThisInitialized(_this), "instrument", "cello");

        _defineProperty(_assertThisInitialized(_this), "amplitudeEnvelope", {
          attack: 0.1,
          hold: 0.01,
          decay: 11,
          sustain: 0,
          release: 0.05
        });

        _defineProperty(_assertThisInitialized(_this), "amplitudeGain", 0.15);

        _defineProperty(_assertThisInitialized(_this), "amplitudeWave", "sawtooth");

        _defineProperty(_assertThisInitialized(_this), "amplitudePitchAdjustment", null);

        _defineProperty(_assertThisInitialized(_this), "amplitudeFrequencyMultiplier", 1);

        _defineProperty(_assertThisInitialized(_this), "frequencyEnvelope", {
          attack: 0.001,
          hold: 0.01,
          decay: 11,
          sustain: 0.2,
          release: 0.05
        });

        _defineProperty(_assertThisInitialized(_this), "frequencyGain", 5);

        _defineProperty(_assertThisInitialized(_this), "frequencyWave", "sine");

        _defineProperty(_assertThisInitialized(_this), "frequencyPitchAdjustment", null);

        _defineProperty(_assertThisInitialized(_this), "frequencyFrequencyMultiplier", 0.5);

        _defineProperty(_assertThisInitialized(_this), "offDelay", 0.25);

        return _this;
      }

      return Cello;
    }(FmSynth);

    var Flute = /*#__PURE__*/function (_FmSynth) {
      _inherits(Flute, _FmSynth);

      var _super = _createSuper(Flute);

      function Flute() {
        var _this;

        _classCallCheck(this, Flute);

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        _this = _super.call.apply(_super, [this].concat(args));

        _defineProperty(_assertThisInitialized(_this), "instrument", "flute");

        _defineProperty(_assertThisInitialized(_this), "amplitudeEnvelope", {
          attack: 0.03,
          hold: 0.01,
          decay: 0.4,
          sustain: 0.4,
          release: 0.05
        });

        _defineProperty(_assertThisInitialized(_this), "amplitudeGain", 0.35);

        _defineProperty(_assertThisInitialized(_this), "amplitudeWave", "sine");

        _defineProperty(_assertThisInitialized(_this), "amplitudePitchAdjustment", null);

        _defineProperty(_assertThisInitialized(_this), "amplitudeFrequencyMultiplier", 1);

        _defineProperty(_assertThisInitialized(_this), "frequencyEnvelope", {
          attack: 0.001,
          hold: 0.01,
          decay: 0.4,
          sustain: 0,
          release: 0.05
        });

        _defineProperty(_assertThisInitialized(_this), "frequencyGain", 4);

        _defineProperty(_assertThisInitialized(_this), "frequencyWave", "sine");

        _defineProperty(_assertThisInitialized(_this), "frequencyPitchAdjustment", null);

        _defineProperty(_assertThisInitialized(_this), "frequencyFrequencyMultiplier", 2);

        _defineProperty(_assertThisInitialized(_this), "offDelay", 0.25);

        return _this;
      }

      return Flute;
    }(FmSynth);

    var Guitar = /*#__PURE__*/function (_FmSynth) {
      _inherits(Guitar, _FmSynth);

      var _super = _createSuper(Guitar);

      function Guitar() {
        var _this;

        _classCallCheck(this, Guitar);

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        _this = _super.call.apply(_super, [this].concat(args));

        _defineProperty(_assertThisInitialized(_this), "instrument", "guitar");

        _defineProperty(_assertThisInitialized(_this), "amplitudeEnvelope", {
          attack: 0.001,
          hold: 0.01,
          decay: 0.5,
          sustain: 0,
          release: 0.05
        });

        _defineProperty(_assertThisInitialized(_this), "amplitudeGain", 0.3);

        _defineProperty(_assertThisInitialized(_this), "amplitudeWave", "sine");

        _defineProperty(_assertThisInitialized(_this), "amplitudePitchAdjustment", null);

        _defineProperty(_assertThisInitialized(_this), "amplitudeFrequencyMultiplier", 1);

        _defineProperty(_assertThisInitialized(_this), "frequencyEnvelope", {
          attack: 0.001,
          hold: 0.01,
          decay: 1,
          sustain: 0.1,
          release: 0.05
        });

        _defineProperty(_assertThisInitialized(_this), "frequencyGain", 5);

        _defineProperty(_assertThisInitialized(_this), "frequencyWave", "triangle");

        _defineProperty(_assertThisInitialized(_this), "frequencyPitchAdjustment", null);

        _defineProperty(_assertThisInitialized(_this), "frequencyFrequencyMultiplier", 3);

        _defineProperty(_assertThisInitialized(_this), "offDelay", 0.25);

        return _this;
      }

      return Guitar;
    }(FmSynth);

    var Harp = /*#__PURE__*/function (_FmSynth) {
      _inherits(Harp, _FmSynth);

      var _super = _createSuper(Harp);

      function Harp() {
        var _this;

        _classCallCheck(this, Harp);

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        _this = _super.call.apply(_super, [this].concat(args));

        _defineProperty(_assertThisInitialized(_this), "instrument", "harp");

        _defineProperty(_assertThisInitialized(_this), "amplitudeEnvelope", {
          attack: 0.001,
          hold: 0.01,
          decay: 0.5,
          sustain: 0,
          release: 0.5
        });

        _defineProperty(_assertThisInitialized(_this), "amplitudeGain", 0.3);

        _defineProperty(_assertThisInitialized(_this), "amplitudeWave", "sine");

        _defineProperty(_assertThisInitialized(_this), "amplitudePitchAdjustment", null);

        _defineProperty(_assertThisInitialized(_this), "amplitudeFrequencyMultiplier", 1);

        _defineProperty(_assertThisInitialized(_this), "frequencyEnvelope", {
          attack: 0.001,
          hold: 0.01,
          decay: 1,
          sustain: 0,
          release: 1
        });

        _defineProperty(_assertThisInitialized(_this), "frequencyGain", 7);

        _defineProperty(_assertThisInitialized(_this), "frequencyWave", "sine");

        _defineProperty(_assertThisInitialized(_this), "frequencyPitchAdjustment", null);

        _defineProperty(_assertThisInitialized(_this), "frequencyFrequencyMultiplier", 2);

        _defineProperty(_assertThisInitialized(_this), "offDelay", 0.25);

        return _this;
      }

      return Harp;
    }(FmSynth);

    var Trumpet = /*#__PURE__*/function (_FmSynth) {
      _inherits(Trumpet, _FmSynth);

      var _super = _createSuper(Trumpet);

      function Trumpet() {
        var _this;

        _classCallCheck(this, Trumpet);

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        _this = _super.call.apply(_super, [this].concat(args));

        _defineProperty(_assertThisInitialized(_this), "instrument", "trumpet");

        _defineProperty(_assertThisInitialized(_this), "amplitudeEnvelope", {
          attack: 0.01,
          hold: 0.01,
          decay: 1,
          sustain: 0.6,
          release: 0.04
        });

        _defineProperty(_assertThisInitialized(_this), "amplitudeGain", 0.1);

        _defineProperty(_assertThisInitialized(_this), "amplitudeWave", "square");

        _defineProperty(_assertThisInitialized(_this), "amplitudePitchAdjustment", null);

        _defineProperty(_assertThisInitialized(_this), "amplitudeFrequencyMultiplier", 1);

        _defineProperty(_assertThisInitialized(_this), "frequencyEnvelope", {
          attack: 0.001,
          hold: 0.01,
          decay: 0.1,
          sustain: 4,
          release: 0.05
        });

        _defineProperty(_assertThisInitialized(_this), "frequencyGain", 1);

        _defineProperty(_assertThisInitialized(_this), "frequencyWave", "sine");

        _defineProperty(_assertThisInitialized(_this), "frequencyPitchAdjustment", null);

        _defineProperty(_assertThisInitialized(_this), "frequencyFrequencyMultiplier", 1);

        _defineProperty(_assertThisInitialized(_this), "offDelay", 0.25);

        return _this;
      }

      return Trumpet;
    }(FmSynth);

    var Violin = /*#__PURE__*/function (_FmSynth) {
      _inherits(Violin, _FmSynth);

      var _super = _createSuper(Violin);

      function Violin() {
        var _this;

        _classCallCheck(this, Violin);

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        _this = _super.call.apply(_super, [this].concat(args));

        _defineProperty(_assertThisInitialized(_this), "instrument", "violin");

        _defineProperty(_assertThisInitialized(_this), "amplitudeEnvelope", {
          attack: 0.1,
          hold: 0.01,
          decay: 11,
          sustain: 0,
          release: 0.05
        });

        _defineProperty(_assertThisInitialized(_this), "amplitudeGain", 0.15);

        _defineProperty(_assertThisInitialized(_this), "amplitudeWave", "sawtooth");

        _defineProperty(_assertThisInitialized(_this), "amplitudePitchAdjustment", null);

        _defineProperty(_assertThisInitialized(_this), "amplitudeFrequencyMultiplier", 1);

        _defineProperty(_assertThisInitialized(_this), "frequencyEnvelope", {
          attack: 0.001,
          hold: 0.01,
          decay: 11,
          sustain: 0.2,
          release: 0.05
        });

        _defineProperty(_assertThisInitialized(_this), "frequencyGain", 5);

        _defineProperty(_assertThisInitialized(_this), "frequencyWave", "sine");

        _defineProperty(_assertThisInitialized(_this), "frequencyPitchAdjustment", null);

        _defineProperty(_assertThisInitialized(_this), "frequencyFrequencyMultiplier", 1);

        _defineProperty(_assertThisInitialized(_this), "offDelay", 0.25);

        return _this;
      }

      return Violin;
    }(FmSynth);

    var sampleNumbers = [3867, 3868, 3869, 3870, 3871, 3872, 3873, 3874, 3875, 3876, 3877, 3878, 3879, 3880, 3881, 3882, 3883, 3884, 3885, 3886, 3887, 3888, 3889, 3890, 3891, 3892, 3893, 3894, 3895, 3896, 3897, 3898, 3899, 3900, 3901, 3902, 3903, 3904, 3905, 3906, 3907, 3908, 3909, 3910, 3911, 3912, 3913, 3914, 3915, 3916, 3917, 3918, 3919, 3920, 3921, 3922, 3923, 3924, 3925, 3926, 3927];
    var Drums = /*#__PURE__*/function (_InstrumentSynth) {
      _inherits(Drums, _InstrumentSynth);

      var _super = _createSuper(Drums);

      function Drums() {
        var _this;

        _classCallCheck(this, Drums);

        _this = _super.call(this);

        _defineProperty(_assertThisInitialized(_this), "instrument", "drums");

        _defineProperty(_assertThisInitialized(_this), "samples", void 0);

        _this.samples = {};
        sampleNumbers.forEach(function (number) {
          _this.samples[number % 128] = new DrumSample(number);
        });
        return _this;
      }

      _createClass(Drums, [{
        key: "setup",
        value: function () {
          var _setup = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(ctx) {
            var promises;
            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    promises = Object.values(this.samples).map(function (sample) {
                      return sample.setup(ctx);
                    });
                    _context.next = 3;
                    return Promise.all(promises);

                  case 3:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee, this);
          }));

          function setup(_x) {
            return _setup.apply(this, arguments);
          }

          return setup;
        }()
      }, {
        key: "loadNote",
        value: function () {
          var _loadNote = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(note, ctx, destination) {
            var pitch, sample;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    pitch = note.pitch;
                    sample = this.samples[pitch];

                    if (!(sample === undefined)) {
                      _context2.next = 5;
                      break;
                    }

                    console.log("Unknown drum sample " + pitch);
                    return _context2.abrupt("return");

                  case 5:
                    _context2.next = 7;
                    return sample.loadNote(note, ctx, destination);

                  case 7:
                  case "end":
                    return _context2.stop();
                }
              }
            }, _callee2, this);
          }));

          function loadNote(_x2, _x3, _x4) {
            return _loadNote.apply(this, arguments);
          }

          return loadNote;
        }()
      }]);

      return Drums;
    }(InstrumentSynth);

    var DrumSample = /*#__PURE__*/function () {
      function DrumSample(pitch) {
        _classCallCheck(this, DrumSample);

        _defineProperty(this, "arrayBufferPromise", void 0);

        _defineProperty(this, "audioBuffer", null);

        this.arrayBufferPromise = fetch("drums/".concat(pitch, ".mp3")).then(function (response) {
          return response.arrayBuffer();
        });
      }

      _createClass(DrumSample, [{
        key: "setup",
        value: function () {
          var _setup2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(ctx) {
            var arrayBuffer;
            return regeneratorRuntime.wrap(function _callee3$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    _context3.next = 2;
                    return this.arrayBufferPromise;

                  case 2:
                    arrayBuffer = _context3.sent;
                    _context3.next = 5;
                    return ctx.decodeAudioData(arrayBuffer.slice(0));

                  case 5:
                    this.audioBuffer = _context3.sent;

                  case 6:
                  case "end":
                    return _context3.stop();
                }
              }
            }, _callee3, this);
          }));

          function setup(_x5) {
            return _setup2.apply(this, arguments);
          }

          return setup;
        }()
      }, {
        key: "loadNote",
        value: function () {
          var _loadNote2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(note, ctx, destination) {
            var gainNode, bufferSource;
            return regeneratorRuntime.wrap(function _callee4$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    gainNode = ctx.createGain();
                    gainNode.gain.setValueAtTime(20, ctx.currentTime);
                    gainNode.connect(destination);
                    bufferSource = ctx.createBufferSource();
                    bufferSource.buffer = this.audioBuffer;
                    bufferSource.connect(gainNode);
                    bufferSource.start(ctx.currentTime + note.startTime - DrumSample.OFFSET);

                  case 7:
                  case "end":
                    return _context4.stop();
                }
              }
            }, _callee4, this);
          }));

          function loadNote(_x6, _x7, _x8) {
            return _loadNote2.apply(this, arguments);
          }

          return loadNote;
        }()
      }]);

      return DrumSample;
    }();

    _defineProperty(DrumSample, "OFFSET", 0);

    var AFTER_RELEASE = 5;
    var synths = {
      bass: new Bass(),
      cello: new Cello(),
      clarinet: new Clarinet(),
      drums: new Drums(),
      flute: new Flute(),
      guitar: new Guitar(),
      harp: new Harp(),
      piano: new Piano(),
      trumpet: new Trumpet(),
      violin: new Violin()
    };
    var sampleRate = 48000;

    function render(_x, _x2) {
      return _render.apply(this, arguments);
    }

    function _render() {
      _render = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(notes, duration) {
        var ctx, gain, promises;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                ctx = new OfflineAudioContext(1, (duration + 2) * sampleRate, sampleRate);
                gain = ctx.createGain();
                gain.gain.value = 0.2;
                gain.connect(ctx.destination);
                promises = Object.values(synths).map(function (it) {
                  return it.schedule(ctx, gain, notes);
                });
                _context.next = 7;
                return Promise.all(promises);

              case 7:
                _context.next = 9;
                return ctx.startRendering();

              case 9:
                return _context.abrupt("return", _context.sent);

              case 10:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));
      return _render.apply(this, arguments);
    }

    function renderAudio(_x3, _x4) {
      return _renderAudio.apply(this, arguments);
    }

    function _renderAudio() {
      _renderAudio = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(encoding, duration) {
        var notes;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                notes = decode(encoding);
                console.log(encoding, notes, duration);
                _context2.next = 4;
                return render(notes, duration);

              case 4:
                return _context2.abrupt("return", _context2.sent);

              case 5:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));
      return _renderAudio.apply(this, arguments);
    }

    function downloadAudio(_x, _x2, _x3) {
      return _downloadAudio.apply(this, arguments);
    }

    function _downloadAudio() {
      _downloadAudio = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(encoding, format, name) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt("return", fetch("https://musenet.openai.com/audio", {
                  method: "POST",
                  body: JSON.stringify({
                    audioFormat: format,
                    encoding: encoding
                  }),
                  headers: {
                    "Content-Type": "application/json"
                  }
                }).then(function (res) {
                  return res.blob();
                }).then(function (blob) {
                  return download(blob, "".concat(name, ".").concat(format));
                }));

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));
      return _downloadAudio.apply(this, arguments);
    }

    function encodingToString(encoding) {
      return encoding.map(function (it) {
        return it.toString();
      }).join(" ");
    }

    function encodingToArray(encoding) {
      return encoding.split(" ").map(function (it) {
        return parseInt(it);
      });
    }

    function request(_x4, _x5, _x6) {
      return _request.apply(this, arguments);
    }

    function _request() {
      _request = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(config, store, state) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!(store.type === "root")) {
                  _context2.next = 4;
                  break;
                }

                _context2.next = 3;
                return requestInternal(config, store, [], 0);

              case 3:
                return _context2.abrupt("return", _context2.sent);

              case 4:
                if (!(store.type === "branch" && state.type === "branch")) {
                  _context2.next = 8;
                  break;
                }

                _context2.next = 7;
                return requestInternal(config, store, state.encoding, state.section.endsAt);

              case 7:
                return _context2.abrupt("return", _context2.sent);

              case 8:
                throw new Error("Unrecognised combination of store and state types " + store.type + "/" + state.type);

              case 9:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));
      return _request.apply(this, arguments);
    }

    function requestInternal(_x7, _x8, _x9, _x10) {
      return _requestInternal.apply(this, arguments);
    }

    function _requestInternal() {
      _requestInternal = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(config, store, prevEncoding, prevDuration) {
        var data;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                data = _objectSpread2(_objectSpread2({}, config), {}, {
                  encoding: encodingToString(prevEncoding),
                  audioFormat: ""
                });
                store.updatePendingLoad(function (it) {
                  return it + 4;
                });
                return _context3.abrupt("return", axios$1({
                  method: "POST",
                  url: "https://musenet.openai.com/sample",
                  data: data
                }).then(function (res) {
                  return res.data.completions;
                }).then(function (completions) {
                  var promises = completions.map(function (completion) {
                    return parseCompletion(completion, prevEncoding, prevDuration);
                  });
                  return Promise.all(promises);
                }).then(function (sections) {
                  return sections.map(function (section) {
                    return createSectionStore(section);
                  });
                }).then(function (sectionStores) {
                  return sectionStores.map(function (sectionStore) {
                    return store.addChild(sectionStore);
                  });
                })["finally"](function () {
                  return store.updatePendingLoad(function (it) {
                    return it - 4;
                  });
                }));

              case 3:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));
      return _requestInternal.apply(this, arguments);
    }

    function parseCompletion(_x11, _x12, _x13) {
      return _parseCompletion.apply(this, arguments);
    }

    function _parseCompletion() {
      _parseCompletion = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(completion, prevEncoding, prevDuration) {
        var fullEncoding, encoding, startsAt, endsAt, notes, audio;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                fullEncoding = encodingToArray(completion.encoding);
                encoding = fullEncoding.slice(prevEncoding.length);
                startsAt = prevDuration;
                endsAt = completion.totalTime;
                notes = parseNotes(completion, prevDuration);
                _context4.next = 7;
                return renderAudio(encoding, endsAt - startsAt);

              case 7:
                audio = _context4.sent;
                return _context4.abrupt("return", {
                  encoding: encoding,
                  startsAt: startsAt,
                  endsAt: endsAt,
                  notes: notes,
                  audio: audio
                });

              case 9:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4);
      }));
      return _parseCompletion.apply(this, arguments);
    }

    function transposeNotes(notes, subtract) {
      return notes.filter(function (note) {
        return note.time_on >= subtract;
      }).filter(function (note) {
        return note.duration > 0;
      }).map(function (note) {
        return _objectSpread2(_objectSpread2({}, note), {}, {
          time_on: note.time_on - subtract
        });
      });
    }

    function parseNotes(_ref, prevDuration) {
      var tracks = _ref.tracks;
      var notesPerInstrument = createEmptyNotes();
      tracks.forEach(function (_ref2) {
        var instrument = _ref2.instrument,
            notes = _ref2.notes;
        return notesPerInstrument[instrument] = transposeNotes(notes, prevDuration);
      });
      return notesPerInstrument;
    }

    /* src/track/SectionOptions.svelte generated by Svelte v3.21.0 */

    const { Object: Object_1, console: console_1 } = globals;
    const file$1 = "src/track/SectionOptions.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (63:2) {#each Object.values(children) as childStore}
    function create_each_block(ctx) {
    	let current;

    	const childbutton = new ChildButton({
    			props: {
    				nodeStore: /*childStore*/ ctx[14],
    				remove: /*func*/ ctx[12]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(childbutton.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(childbutton, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const childbutton_changes = {};
    			if (dirty & /*children*/ 8) childbutton_changes.nodeStore = /*childStore*/ ctx[14];
    			childbutton.$set(childbutton_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(childbutton.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(childbutton.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(childbutton, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(63:2) {#each Object.values(children) as childStore}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let t0;
    	let button0;
    	let t1;

    	let t2_value = (/*pendingLoad*/ ctx[4]
    	? ` (${/*pendingLoad*/ ctx[4]} pending)`
    	: "") + "";

    	let t2;
    	let t3;
    	let button1;
    	let current;
    	let dispose;
    	let each_value = Object.values(/*children*/ ctx[3]);
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
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			button0 = element("button");
    			t1 = text("Load More");
    			t2 = text(t2_value);
    			t3 = space();
    			button1 = element("button");
    			button1.textContent = "Log";
    			attr_dev(button0, "class", "rowButton svelte-lla2mt");
    			add_location(button0, file$1, 65, 2, 2568);
    			attr_dev(button1, "class", "rowButton svelte-lla2mt");
    			add_location(button1, file$1, 68, 2, 2691);
    			attr_dev(div, "class", "buttonRow svelte-lla2mt");
    			add_location(div, file$1, 61, 0, 2403);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t0);
    			append_dev(div, button0);
    			append_dev(button0, t1);
    			append_dev(button0, t2);
    			append_dev(div, t3);
    			append_dev(div, button1);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button0, "click", /*loadMore*/ ctx[5], false, false, false),
    				listen_dev(button1, "click", /*click_handler*/ ctx[13], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Object, children, console*/ 8) {
    				each_value = Object.values(/*children*/ ctx[3]);
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
    						each_blocks[i].m(div, t0);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if ((!current || dirty & /*pendingLoad*/ 16) && t2_value !== (t2_value = (/*pendingLoad*/ ctx[4]
    			? ` (${/*pendingLoad*/ ctx[4]} pending)`
    			: "") + "")) set_data_dev(t2, t2_value);
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
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
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

    function instance$1($$self, $$props, $$invalidate) {
    	let $selectedStore_2,
    		$$unsubscribe_selectedStore_2 = noop,
    		$$subscribe_selectedStore_2 = () => ($$unsubscribe_selectedStore_2(), $$unsubscribe_selectedStore_2 = subscribe(selectedStore_2, $$value => $$invalidate(7, $selectedStore_2 = $$value)), selectedStore_2);

    	let $nodeStore,
    		$$unsubscribe_nodeStore = noop,
    		$$subscribe_nodeStore = () => ($$unsubscribe_nodeStore(), $$unsubscribe_nodeStore = subscribe(nodeStore, $$value => $$invalidate(8, $nodeStore = $$value)), nodeStore);

    	let $configStore;
    	validate_store(configStore, "configStore");
    	component_subscribe($$self, configStore, $$value => $$invalidate(11, $configStore = $$value));
    	$$self.$$.on_destroy.push(() => $$unsubscribe_selectedStore_2());
    	$$self.$$.on_destroy.push(() => $$unsubscribe_nodeStore());

    	function loadMore() {
    		if (nodeState === null) return;
    		return request($configStore, nodeStore, nodeState);
    	}

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<SectionOptions> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("SectionOptions", $$slots, []);
    	const func = () => console.log("removed");
    	const click_handler = () => console.log(JSON.stringify(nodeState));

    	$$self.$capture_state = () => ({
    		root,
    		writable,
    		ChildButton,
    		configStore,
    		request,
    		createSectionStore,
    		loadMore,
    		selectedStore_2,
    		selectedStore,
    		$selectedStore_2,
    		nodeStore,
    		nodeState,
    		$nodeStore,
    		children,
    		selectedPath,
    		lastSelectedChild,
    		pendingLoad,
    		$configStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("selectedStore_2" in $$props) $$subscribe_selectedStore_2($$invalidate(0, selectedStore_2 = $$props.selectedStore_2));
    		if ("selectedStore" in $$props) $$invalidate(6, selectedStore = $$props.selectedStore);
    		if ("nodeStore" in $$props) $$subscribe_nodeStore($$invalidate(1, nodeStore = $$props.nodeStore));
    		if ("nodeState" in $$props) $$invalidate(2, nodeState = $$props.nodeState);
    		if ("children" in $$props) $$invalidate(3, children = $$props.children);
    		if ("selectedPath" in $$props) selectedPath = $$props.selectedPath;
    		if ("lastSelectedChild" in $$props) lastSelectedChild = $$props.lastSelectedChild;
    		if ("pendingLoad" in $$props) $$invalidate(4, pendingLoad = $$props.pendingLoad);
    	};

    	let selectedStore_2;
    	let selectedStore;
    	let nodeStore;
    	let nodeState;
    	let children;
    	let selectedPath;
    	let lastSelectedChild;
    	let pendingLoad;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$selectedStore_2*/ 128) {
    			 $$invalidate(6, selectedStore = $selectedStore_2);
    		}

    		if ($$self.$$.dirty & /*selectedStore*/ 64) {
    			 $$subscribe_nodeStore($$invalidate(1, nodeStore = selectedStore == null ? root : selectedStore));
    		}

    		if ($$self.$$.dirty & /*$nodeStore*/ 256) {
    			 $$invalidate(2, nodeState = $nodeStore);
    		}

    		if ($$self.$$.dirty & /*nodeState*/ 4) {
    			 $$invalidate(3, children = nodeState.children);
    		}

    		if ($$self.$$.dirty & /*nodeState*/ 4) {
    			 selectedPath = nodeState.path;
    		}

    		if ($$self.$$.dirty & /*nodeState*/ 4) {
    			 lastSelectedChild = nodeState.lastSelected;
    		}

    		if ($$self.$$.dirty & /*nodeState*/ 4) {
    			 $$invalidate(4, pendingLoad = nodeState.pendingLoad);
    		}
    	};

    	 $$subscribe_selectedStore_2($$invalidate(0, selectedStore_2 = root.selectedStore_2));

    	return [
    		selectedStore_2,
    		nodeStore,
    		nodeState,
    		children,
    		pendingLoad,
    		loadMore,
    		selectedStore,
    		$selectedStore_2,
    		$nodeStore,
    		selectedPath,
    		lastSelectedChild,
    		$configStore,
    		func,
    		click_handler
    	];
    }

    class SectionOptions extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SectionOptions",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    var sampleRate$1 = 48000;
    function combine(_x) {
      return _combine.apply(this, arguments);
    }

    function _combine() {
      _combine = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(data) {
        var duration, ctx;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                duration = Math.max.apply(Math, _toConsumableArray(data.map(function (it) {
                  return it.end;
                })));
                ctx = new OfflineAudioContext(1, duration * sampleRate$1, sampleRate$1);
                data.forEach(function (_ref) {
                  var buffer = _ref.buffer,
                      start = _ref.start;
                  var source = ctx.createBufferSource();
                  source.buffer = buffer;
                  source.connect(ctx.destination);
                  source.start(start);
                });
                _context.next = 5;
                return ctx.startRendering();

              case 5:
                return _context.abrupt("return", _context.sent);

              case 6:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));
      return _combine.apply(this, arguments);
    }

    var audioStatusStoreInternal = writable({
      type: "off"
    });
    var audioStatusStore = audioStatusStoreInternal;
    var audioStatus = {
      type: "off"
    };
    audioStatusStore.subscribe(function (newStatus) {
      audioStatus = newStatus;
    });
    var ctx = new AudioContext({
      sampleRate: 48000
    });
    var autoPlay = false;
    var prePlayTime = 0;
    autoPlayStore.subscribe(function (state) {
      return autoPlay = state;
    });
    preplayStore.subscribe(function (state) {
      return prePlayTime = state;
    });
    var trackAudio = null;
    selectedPathStore.subscribe(load);

    function load(_x) {
      return _load.apply(this, arguments);
    }

    function _load() {
      _load = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(path) {
        var node, track, data, buffer, duration, offset, clamped;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                console.log("Loading");
                stop();

                if (!(path === null)) {
                  _context.next = 4;
                  break;
                }

                return _context.abrupt("return");

              case 4:
                audioStatusStore.set({
                  type: "loading"
                });
                node = get_store_value(root);
                track = [];
                path.forEach(function (childIdx) {
                  var childStore = node.children[childIdx];
                  var childState = get_store_value(childStore);
                  track.push(childState.section);
                  node = childState;
                });
                console.log("Sections: ", track);

                if (track.length) {
                  _context.next = 11;
                  break;
                }

                return _context.abrupt("return");

              case 11:
                data = track.map(function (section) {
                  return {
                    start: section.startsAt,
                    end: section.endsAt,
                    buffer: section.audio
                  };
                });
                _context.next = 14;
                return combine(data);

              case 14:
                buffer = _context.sent;
                duration = data[data.length - 1].end;
                trackAudio = {
                  buffer: buffer,
                  duration: duration
                };

                if (!autoPlay) {
                  _context.next = 22;
                  break;
                }

                offset = data[data.length - 1].start - prePlayTime;
                clamped = Math.max(offset, 0);
                _context.next = 22;
                return play(clamped);

              case 22:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));
      return _load.apply(this, arguments);
    }

    var source = null;
    function play(_x2) {
      return _play.apply(this, arguments);
    }

    function _play() {
      _play = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(offset) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                if (!(trackAudio === null)) {
                  _context2.next = 2;
                  break;
                }

                return _context2.abrupt("return");

              case 2:
                if (audioStatus.type === "on") stop();
                audioStatusStoreInternal.set({
                  type: "starting"
                });
                source = ctx.createBufferSource();
                source.buffer = trackAudio.buffer;
                source.connect(ctx.destination);
                source.onended = stop;
                source.start(undefined, offset);
                audioStatusStoreInternal.set({
                  type: "on",
                  started: ctx.currentTime,
                  offset: offset,
                  duration: trackAudio.duration
                });

              case 10:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));
      return _play.apply(this, arguments);
    }

    function stop() {
      if (!source) return;

      source.onended = function () {};

      source.stop();
      source = null;
      audioStatusStoreInternal.set({
        type: "off"
      });
    }

    var Audio = /*#__PURE__*/Object.freeze({
        __proto__: null,
        audioStatusStore: audioStatusStore,
        play: play,
        stop: stop
    });

    /* src/track/SectionCanvas.svelte generated by Svelte v3.21.0 */

    const { Object: Object_1$1 } = globals;
    const file$2 = "src/track/SectionCanvas.svelte";

    // (103:0) {#if notes}
    function create_if_block_1(ctx) {
    	let canvas_1;
    	let t;
    	let canvas_1_resize_listener;
    	let dispose;

    	const block = {
    		c: function create() {
    			canvas_1 = element("canvas");
    			t = text("HTML5 Canvas not Supported");
    			attr_dev(canvas_1, "class", "sectionCanvas svelte-drgk39");
    			attr_dev(canvas_1, "width", /*clientWidth*/ ctx[4]);
    			attr_dev(canvas_1, "height", /*height*/ ctx[8]);
    			add_render_callback(() => /*canvas_1_elementresize_handler*/ ctx[24].call(canvas_1));
    			add_location(canvas_1, file$2, 103, 2, 3456);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, canvas_1, anchor);
    			append_dev(canvas_1, t);
    			canvas_1_resize_listener = add_resize_listener(canvas_1, /*canvas_1_elementresize_handler*/ ctx[24].bind(canvas_1));
    			/*canvas_1_binding*/ ctx[25](canvas_1);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(canvas_1, "click", /*play*/ ctx[11], false, false, false),
    				listen_dev(
    					canvas_1,
    					"contextmenu",
    					prevent_default(function () {
    						if (is_function(/*deselect*/ ctx[2]())) /*deselect*/ ctx[2]().apply(this, arguments);
    					}),
    					false,
    					true,
    					false
    				)
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*clientWidth*/ 16) {
    				attr_dev(canvas_1, "width", /*clientWidth*/ ctx[4]);
    			}

    			if (dirty & /*height*/ 256) {
    				attr_dev(canvas_1, "height", /*height*/ ctx[8]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(canvas_1);
    			canvas_1_resize_listener();
    			/*canvas_1_binding*/ ctx[25](null);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(103:0) {#if notes}",
    		ctx
    	});

    	return block;
    }

    // (117:0) {#if selectedChildStore !== null}
    function create_if_block(ctx) {
    	let current;

    	const sectioncanvas = new SectionCanvas({
    			props: {
    				branchStore: /*selectedChildStore*/ ctx[10],
    				section: /*index*/ ctx[1] + 1,
    				deselect: /*func*/ ctx[26]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(sectioncanvas.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(sectioncanvas, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const sectioncanvas_changes = {};
    			if (dirty & /*selectedChildStore*/ 1024) sectioncanvas_changes.branchStore = /*selectedChildStore*/ ctx[10];
    			if (dirty & /*index*/ 2) sectioncanvas_changes.section = /*index*/ ctx[1] + 1;
    			if (dirty & /*path*/ 64) sectioncanvas_changes.deselect = /*func*/ ctx[26];
    			sectioncanvas.$set(sectioncanvas_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sectioncanvas.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sectioncanvas.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sectioncanvas, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(117:0) {#if selectedChildStore !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*notes*/ ctx[7] && create_if_block_1(ctx);
    	let if_block1 = /*selectedChildStore*/ ctx[10] !== null && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*notes*/ ctx[7]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*selectedChildStore*/ ctx[10] !== null) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*selectedChildStore*/ 1024) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
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
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
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
    	let $branchStore,
    		$$unsubscribe_branchStore = noop,
    		$$subscribe_branchStore = () => ($$unsubscribe_branchStore(), $$unsubscribe_branchStore = subscribe(branchStore, $$value => $$invalidate(14, $branchStore = $$value)), branchStore);

    	let $yScaleStore;

    	let $selectedChildStore_2,
    		$$unsubscribe_selectedChildStore_2 = noop,
    		$$subscribe_selectedChildStore_2 = () => ($$unsubscribe_selectedChildStore_2(), $$unsubscribe_selectedChildStore_2 = subscribe(selectedChildStore_2, $$value => $$invalidate(21, $selectedChildStore_2 = $$value)), selectedChildStore_2);

    	validate_store(yScaleStore, "yScaleStore");
    	component_subscribe($$self, yScaleStore, $$value => $$invalidate(19, $yScaleStore = $$value));
    	$$self.$$.on_destroy.push(() => $$unsubscribe_branchStore());
    	$$self.$$.on_destroy.push(() => $$unsubscribe_selectedChildStore_2());
    	let { branchStore } = $$props;
    	validate_store(branchStore, "branchStore");
    	$$subscribe_branchStore();
    	let { index } = $$props;
    	let { deselect } = $$props;
    	let canvas;
    	let clientWidth;
    	let clientHeight;
    	afterUpdate(() => setTimeout(draw, 0));

    	function draw() {
    		if (canvas == null || notes == null) return;
    		const ctx = canvas.getContext("2d");
    		ctx.clearRect(0, 0, canvas.width, canvas.height);
    		const border = "white";
    		ctx.strokeStyle = border;
    		ctx.lineWidth = 1;
    		ctx.moveTo(0, canvas.height - 0.5);
    		ctx.lineTo(canvas.width, canvas.height - 0.5);
    		ctx.stroke();

    		Object.keys(notes).forEach((instrument, idx) => {
    			const instrumentNotes = notes[instrument];
    			const settings = instrumentSettings[instrument];
    			const { color } = settings;
    			drawInstrument(ctx, instrumentNotes, color, idx / Object.keys(instrumentSettings).length, "black");
    		});

    		ctx.fillStyle = "white";
    		ctx.textAlign = "right";
    		ctx.font = "14px arial";
    		const text = `Section ${index + 1}: ${childIndex}`;
    		ctx.fillText(text, canvas.width - 2.5, 12.5);
    	}

    	function drawInstrument(ctx, notes, color, xOffset, background) {
    		ctx.fillStyle = color;
    		ctx.strokeStyle = background;
    		ctx.lineWidth = 1;

    		notes.forEach(note => {
    			const xStart = Math.round((xOffset + note.pitch - pitchMin) * xScale) + 0.5;
    			const yStart = Math.round(note.time_on * $yScaleStore) + 0.5;
    			const noteWidth = Math.round(xScale);
    			const noteHeight = Math.round(note.duration * $yScaleStore);
    			ctx.fillRect(xStart, yStart, noteWidth, noteHeight);
    			if (noteHeight > 2) ctx.strokeRect(xStart, yStart, noteWidth, noteHeight);
    		});
    	}

    	function play$1(event) {
    		const rect = event.target.getBoundingClientRect();
    		const y = event.clientY - rect.top;
    		const fraction = y / height;
    		const addDuration = sectionDuration * fraction;
    		const totalDuration = section.startsAt + addDuration;
    		play(totalDuration);
    	}

    	const writable_props = ["branchStore", "index", "deselect"];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SectionCanvas> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("SectionCanvas", $$slots, []);

    	function canvas_1_elementresize_handler() {
    		clientWidth = this.clientWidth;
    		clientHeight = this.clientHeight;
    		$$invalidate(4, clientWidth);
    		$$invalidate(5, clientHeight);
    	}

    	function canvas_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(3, canvas = $$value);
    		});
    	}

    	const func = () => root.select(path);

    	$$self.$set = $$props => {
    		if ("branchStore" in $$props) $$subscribe_branchStore($$invalidate(0, branchStore = $$props.branchStore));
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    		if ("deselect" in $$props) $$invalidate(2, deselect = $$props.deselect);
    	};

    	$$self.$capture_state = () => ({
    		yScaleStore,
    		pitchRange,
    		pitchMin,
    		instrumentSettings,
    		afterUpdate,
    		root,
    		Audio,
    		branchStore,
    		index,
    		deselect,
    		canvas,
    		clientWidth,
    		clientHeight,
    		draw,
    		drawInstrument,
    		play: play$1,
    		xScale,
    		branchState,
    		$branchStore,
    		path,
    		childIndex,
    		section,
    		notes,
    		startsAt,
    		sectionDuration,
    		height,
    		$yScaleStore,
    		position,
    		selectedChildStore_2,
    		selectedChildStore,
    		$selectedChildStore_2
    	});

    	$$self.$inject_state = $$props => {
    		if ("branchStore" in $$props) $$subscribe_branchStore($$invalidate(0, branchStore = $$props.branchStore));
    		if ("index" in $$props) $$invalidate(1, index = $$props.index);
    		if ("deselect" in $$props) $$invalidate(2, deselect = $$props.deselect);
    		if ("canvas" in $$props) $$invalidate(3, canvas = $$props.canvas);
    		if ("clientWidth" in $$props) $$invalidate(4, clientWidth = $$props.clientWidth);
    		if ("clientHeight" in $$props) $$invalidate(5, clientHeight = $$props.clientHeight);
    		if ("xScale" in $$props) xScale = $$props.xScale;
    		if ("branchState" in $$props) $$invalidate(13, branchState = $$props.branchState);
    		if ("path" in $$props) $$invalidate(6, path = $$props.path);
    		if ("childIndex" in $$props) childIndex = $$props.childIndex;
    		if ("section" in $$props) $$invalidate(16, section = $$props.section);
    		if ("notes" in $$props) $$invalidate(7, notes = $$props.notes);
    		if ("startsAt" in $$props) $$invalidate(17, startsAt = $$props.startsAt);
    		if ("sectionDuration" in $$props) $$invalidate(18, sectionDuration = $$props.sectionDuration);
    		if ("height" in $$props) $$invalidate(8, height = $$props.height);
    		if ("position" in $$props) position = $$props.position;
    		if ("selectedChildStore_2" in $$props) $$subscribe_selectedChildStore_2($$invalidate(9, selectedChildStore_2 = $$props.selectedChildStore_2));
    		if ("selectedChildStore" in $$props) $$invalidate(10, selectedChildStore = $$props.selectedChildStore);
    	};

    	let xScale;
    	let branchState;
    	let path;
    	let childIndex;
    	let section;
    	let notes;
    	let startsAt;
    	let sectionDuration;
    	let height;
    	let position;
    	let selectedChildStore_2;
    	let selectedChildStore;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*clientWidth*/ 16) {
    			 xScale = clientWidth / pitchRange;
    		}

    		if ($$self.$$.dirty & /*$branchStore*/ 16384) {
    			 $$invalidate(13, branchState = $branchStore);
    		}

    		if ($$self.$$.dirty & /*branchState*/ 8192) {
    			 $$invalidate(6, path = branchState.path);
    		}

    		if ($$self.$$.dirty & /*path*/ 64) {
    			 childIndex = path[path.length - 1];
    		}

    		if ($$self.$$.dirty & /*branchState*/ 8192) {
    			 $$invalidate(16, section = branchState === null ? null : branchState.section);
    		}

    		if ($$self.$$.dirty & /*section*/ 65536) {
    			 $$invalidate(7, notes = section === null ? null : section.notes);
    		}

    		if ($$self.$$.dirty & /*section*/ 65536) {
    			 $$invalidate(17, startsAt = section ? section.startsAt : null);
    		}

    		if ($$self.$$.dirty & /*section, startsAt*/ 196608) {
    			 $$invalidate(18, sectionDuration = section ? section.endsAt - startsAt : 0);
    		}

    		if ($$self.$$.dirty & /*sectionDuration, $yScaleStore*/ 786432) {
    			 $$invalidate(8, height = sectionDuration * $yScaleStore);
    		}

    		if ($$self.$$.dirty & /*startsAt, $yScaleStore*/ 655360) {
    			 position = startsAt * $yScaleStore;
    		}

    		if ($$self.$$.dirty & /*branchStore*/ 1) {
    			 $$subscribe_selectedChildStore_2($$invalidate(9, selectedChildStore_2 = branchStore.selectedChildStore_2));
    		}

    		if ($$self.$$.dirty & /*$selectedChildStore_2*/ 2097152) {
    			 $$invalidate(10, selectedChildStore = $selectedChildStore_2);
    		}
    	};

    	return [
    		branchStore,
    		index,
    		deselect,
    		canvas,
    		clientWidth,
    		clientHeight,
    		path,
    		notes,
    		height,
    		selectedChildStore_2,
    		selectedChildStore,
    		play$1,
    		xScale,
    		branchState,
    		$branchStore,
    		childIndex,
    		section,
    		startsAt,
    		sectionDuration,
    		$yScaleStore,
    		position,
    		$selectedChildStore_2,
    		draw,
    		drawInstrument,
    		canvas_1_elementresize_handler,
    		canvas_1_binding,
    		func
    	];
    }

    class SectionCanvas extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { branchStore: 0, index: 1, deselect: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SectionCanvas",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*branchStore*/ ctx[0] === undefined && !("branchStore" in props)) {
    			console.warn("<SectionCanvas> was created without expected prop 'branchStore'");
    		}

    		if (/*index*/ ctx[1] === undefined && !("index" in props)) {
    			console.warn("<SectionCanvas> was created without expected prop 'index'");
    		}

    		if (/*deselect*/ ctx[2] === undefined && !("deselect" in props)) {
    			console.warn("<SectionCanvas> was created without expected prop 'deselect'");
    		}
    	}

    	get branchStore() {
    		throw new Error("<SectionCanvas>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set branchStore(value) {
    		throw new Error("<SectionCanvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<SectionCanvas>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<SectionCanvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get deselect() {
    		throw new Error("<SectionCanvas>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set deselect(value) {
    		throw new Error("<SectionCanvas>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/track/Timeline.svelte generated by Svelte v3.21.0 */
    const file$3 = "src/track/Timeline.svelte";

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "line svelte-kzguc6");
    			div0.hidden = /*hidden*/ ctx[1];
    			add_location(div0, file$3, 70, 2, 2400);
    			attr_dev(div1, "class", "anchor svelte-kzguc6");
    			add_location(div1, file$3, 66, 0, 2292);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			/*div1_binding*/ ctx[7](div1);
    			if (remount) dispose();
    			dispose = listen_dev(div1, "introend", /*introend_handler*/ ctx[8], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*hidden*/ 2) {
    				prop_dev(div0, "hidden", /*hidden*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			/*div1_binding*/ ctx[7](null);
    			dispose();
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
    	let $yScaleStore;
    	let $isScrollingStore;
    	let $autoScrollStore;
    	validate_store(yScaleStore, "yScaleStore");
    	component_subscribe($$self, yScaleStore, $$value => $$invalidate(3, $yScaleStore = $$value));
    	validate_store(isScrollingStore, "isScrollingStore");
    	component_subscribe($$self, isScrollingStore, $$value => $$invalidate(4, $isScrollingStore = $$value));
    	validate_store(autoScrollStore, "autoScrollStore");
    	component_subscribe($$self, autoScrollStore, $$value => $$invalidate(5, $autoScrollStore = $$value));

    	function traverse(node, { offset: startTime, duration: endTime }) {
    		const transTime = endTime - startTime;

    		return {
    			duration: transTime * 1000,
    			tick: t => {
    				const startPx = startTime * $yScaleStore;
    				const endPx = endTime * $yScaleStore;
    				const transPx = endPx - startPx;
    				const y = startPx + t * transPx;
    				node.style = `top:${y}px;`;

    				if ($isScrollingStore) {
    					node.scrollIntoView({ block: "center", behaviour: "smooth" });
    				}
    			}
    		};
    	}

    	let element;
    	let transition;
    	let hidden = true;

    	audioStatusStore.subscribe(status => {
    		if (transition) transition.end();
    		$$invalidate(1, hidden = status.type !== "on");

    		if (!hidden) {
    			isScrollingStore.set($autoScrollStore);
    			transition = create_in_transition(element, traverse, status);
    			transition.start();
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Timeline> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Timeline", $$slots, []);

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(0, element = $$value);
    		});
    	}

    	const introend_handler = () => {
    		$$invalidate(1, hidden = true);
    	};

    	$$self.$capture_state = () => ({
    		audioStatusStore,
    		yScaleStore,
    		autoScrollStore,
    		isScrollingStore,
    		create_in_transition,
    		traverse,
    		element,
    		transition,
    		hidden,
    		$yScaleStore,
    		$isScrollingStore,
    		$autoScrollStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("element" in $$props) $$invalidate(0, element = $$props.element);
    		if ("transition" in $$props) transition = $$props.transition;
    		if ("hidden" in $$props) $$invalidate(1, hidden = $$props.hidden);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		element,
    		hidden,
    		transition,
    		$yScaleStore,
    		$isScrollingStore,
    		$autoScrollStore,
    		traverse,
    		div1_binding,
    		introend_handler
    	];
    }

    class Timeline extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Timeline",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/track/Track.svelte generated by Svelte v3.21.0 */
    const file$4 = "src/track/Track.svelte";

    // (30:4) {:else}
    function create_else_block(ctx) {
    	let current;

    	const sectioncanvas = new SectionCanvas({
    			props: {
    				branchStore: /*selectedChildStore*/ ctx[1],
    				index: 0,
    				deselect: /*func*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(sectioncanvas.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(sectioncanvas, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const sectioncanvas_changes = {};
    			if (dirty & /*selectedChildStore*/ 2) sectioncanvas_changes.branchStore = /*selectedChildStore*/ ctx[1];
    			sectioncanvas.$set(sectioncanvas_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sectioncanvas.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sectioncanvas.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(sectioncanvas, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(30:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (28:4) {#if selectedChildStore === null}
    function create_if_block$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Use the controls below to begin";
    			attr_dev(p, "class", "placeholder svelte-1awtocg");
    			add_location(p, file$4, 28, 8, 1237);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(28:4) {#if selectedChildStore === null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let t0;
    	let current_block_type_index;
    	let if_block;
    	let t1;
    	let current;
    	let dispose;
    	const timeline = new Timeline({ $$inline: true });
    	const if_block_creators = [create_if_block$1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*selectedChildStore*/ ctx[1] === null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	const sectionrowoptions = new SectionOptions({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(timeline.$$.fragment);
    			t0 = space();
    			if_block.c();
    			t1 = space();
    			create_component(sectionrowoptions.$$.fragment);
    			attr_dev(div, "class", "container svelte-1awtocg");
    			add_location(div, file$4, 25, 0, 1103);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			mount_component(timeline, div, null);
    			append_dev(div, t0);
    			if_blocks[current_block_type_index].m(div, null);
    			insert_dev(target, t1, anchor);
    			mount_component(sectionrowoptions, target, anchor);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(div, "wheel", /*wheel_handler*/ ctx[4], { passive: true }, false, false);
    		},
    		p: function update(ctx, [dirty]) {
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
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(timeline.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(sectionrowoptions.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(timeline.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(sectionrowoptions.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(timeline);
    			if_blocks[current_block_type_index].d();
    			if (detaching) detach_dev(t1);
    			destroy_component(sectionrowoptions, detaching);
    			dispose();
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
    	let $selectedChildStore_2,
    		$$unsubscribe_selectedChildStore_2 = noop,
    		$$subscribe_selectedChildStore_2 = () => ($$unsubscribe_selectedChildStore_2(), $$unsubscribe_selectedChildStore_2 = subscribe(selectedChildStore_2, $$value => $$invalidate(2, $selectedChildStore_2 = $$value)), selectedChildStore_2);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_selectedChildStore_2());
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Track> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Track", $$slots, []);
    	const func = () => root.select([]);
    	const wheel_handler = () => isScrollingStore.set(false);

    	$$self.$capture_state = () => ({
    		SectionRowOptions: SectionOptions,
    		SectionCanvas,
    		isScrollingStore,
    		root,
    		Timeline,
    		selectedChildStore_2,
    		selectedChildStore,
    		$selectedChildStore_2
    	});

    	$$self.$inject_state = $$props => {
    		if ("selectedChildStore_2" in $$props) $$subscribe_selectedChildStore_2($$invalidate(0, selectedChildStore_2 = $$props.selectedChildStore_2));
    		if ("selectedChildStore" in $$props) $$invalidate(1, selectedChildStore = $$props.selectedChildStore);
    	};

    	let selectedChildStore_2;
    	let selectedChildStore;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$selectedChildStore_2*/ 4) {
    			 $$invalidate(1, selectedChildStore = $selectedChildStore_2);
    		}
    	};

    	 $$subscribe_selectedChildStore_2($$invalidate(0, selectedChildStore_2 = root.selectedChildStore_2));

    	return [
    		selectedChildStore_2,
    		selectedChildStore,
    		$selectedChildStore_2,
    		func,
    		wheel_handler
    	];
    }

    class Track extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Track",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/generationOptions/InstrumentCheckbox.svelte generated by Svelte v3.21.0 */
    const file$5 = "src/generationOptions/InstrumentCheckbox.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let input;
    	let t0;
    	let label;
    	let t1;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			label = element("label");
    			t1 = text(/*instrument*/ ctx[0]);
    			attr_dev(input, "id", /*id*/ ctx[2]);
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "class", "svelte-ex0ulq");
    			add_location(input, file$5, 32, 2, 1278);
    			attr_dev(label, "for", /*id*/ ctx[2]);
    			attr_dev(label, "class", "svelte-ex0ulq");
    			add_location(label, file$5, 33, 2, 1340);
    			attr_dev(div, "class", "row svelte-ex0ulq");
    			add_location(div, file$5, 31, 0, 1258);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			input.checked = /*$enabledStore*/ ctx[3];
    			append_dev(div, t0);
    			append_dev(div, label);
    			append_dev(label, t1);
    			if (remount) dispose();
    			dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[4]);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*id*/ 4) {
    				attr_dev(input, "id", /*id*/ ctx[2]);
    			}

    			if (dirty & /*$enabledStore*/ 8) {
    				input.checked = /*$enabledStore*/ ctx[3];
    			}

    			if (dirty & /*instrument*/ 1) set_data_dev(t1, /*instrument*/ ctx[0]);

    			if (dirty & /*id*/ 4) {
    				attr_dev(label, "for", /*id*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
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
    	let $enabledStore,
    		$$unsubscribe_enabledStore = noop,
    		$$subscribe_enabledStore = () => ($$unsubscribe_enabledStore(), $$unsubscribe_enabledStore = subscribe(enabledStore, $$value => $$invalidate(3, $enabledStore = $$value)), enabledStore);

    	$$self.$$.on_destroy.push(() => $$unsubscribe_enabledStore());
    	let { instrument } = $$props;
    	const writable_props = ["instrument"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<InstrumentCheckbox> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("InstrumentCheckbox", $$slots, []);

    	function input_change_handler() {
    		$enabledStore = this.checked;
    		enabledStore.set($enabledStore);
    	}

    	$$self.$set = $$props => {
    		if ("instrument" in $$props) $$invalidate(0, instrument = $$props.instrument);
    	};

    	$$self.$capture_state = () => ({
    		instrumentStores,
    		instrument,
    		enabledStore,
    		id,
    		$enabledStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("instrument" in $$props) $$invalidate(0, instrument = $$props.instrument);
    		if ("enabledStore" in $$props) $$subscribe_enabledStore($$invalidate(1, enabledStore = $$props.enabledStore));
    		if ("id" in $$props) $$invalidate(2, id = $$props.id);
    	};

    	let enabledStore;
    	let id;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*instrument*/ 1) {
    			 $$subscribe_enabledStore($$invalidate(1, enabledStore = instrumentStores[instrument]));
    		}

    		if ($$self.$$.dirty & /*instrument*/ 1) {
    			 $$invalidate(2, id = "instrument-" + instrument);
    		}
    	};

    	return [instrument, enabledStore, id, $enabledStore, input_change_handler];
    }

    class InstrumentCheckbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { instrument: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "InstrumentCheckbox",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*instrument*/ ctx[0] === undefined && !("instrument" in props)) {
    			console.warn("<InstrumentCheckbox> was created without expected prop 'instrument'");
    		}
    	}

    	get instrument() {
    		throw new Error("<InstrumentCheckbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set instrument(value) {
    		throw new Error("<InstrumentCheckbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/generationOptions/GenerationOptions.svelte generated by Svelte v3.21.0 */
    const file$6 = "src/generationOptions/GenerationOptions.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (74:6) {#each genres as genre}
    function create_each_block_1(ctx) {
    	let option;
    	let t_value = /*genre*/ ctx[9] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*genre*/ ctx[9];
    			option.value = option.__value;
    			add_location(option, file$6, 74, 8, 2677);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(74:6) {#each genres as genre}",
    		ctx
    	});

    	return block;
    }

    // (94:2) {#each instrumentCategories as instrument}
    function create_each_block$1(ctx) {
    	let current;

    	const instrumentcheckbox = new InstrumentCheckbox({
    			props: { instrument: /*instrument*/ ctx[6] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(instrumentcheckbox.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(instrumentcheckbox, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(instrumentcheckbox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(instrumentcheckbox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(instrumentcheckbox, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(94:2) {#each instrumentCategories as instrument}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div3;
    	let h1;
    	let t1;
    	let div0;
    	let label0;
    	let t3;
    	let select;
    	let t4;
    	let div1;
    	let label1;
    	let t6;
    	let input0;
    	let t7;
    	let span;
    	let t8;
    	let t9;
    	let label2;
    	let t11;
    	let t12;
    	let div2;
    	let label3;
    	let t14;
    	let input1;
    	let current;
    	let dispose;
    	let each_value_1 = genres;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = instrumentCategories;
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
    			div3 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Generator:";
    			t1 = space();
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Genre:";
    			t3 = space();
    			select = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t4 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Generation Length:";
    			t6 = space();
    			input0 = element("input");
    			t7 = space();
    			span = element("span");
    			t8 = text(/*$generationLengthStore*/ ctx[1]);
    			t9 = space();
    			label2 = element("label");
    			label2.textContent = "Instruments:";
    			t11 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t12 = space();
    			div2 = element("div");
    			label3 = element("label");
    			label3.textContent = "Auto Request";
    			t14 = space();
    			input1 = element("input");
    			attr_dev(h1, "class", "header svelte-1te3to");
    			add_location(h1, file$6, 69, 2, 2487);
    			attr_dev(label0, "for", "genre");
    			attr_dev(label0, "class", "svelte-1te3to");
    			add_location(label0, file$6, 71, 4, 2556);
    			attr_dev(select, "id", "genre");
    			attr_dev(select, "class", "svelte-1te3to");
    			if (/*$genreStore*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[3].call(select));
    			add_location(select, file$6, 72, 4, 2594);
    			attr_dev(div0, "class", "optionElement svelte-1te3to");
    			add_location(div0, file$6, 70, 2, 2524);
    			attr_dev(label1, "for", "generationlength");
    			attr_dev(label1, "class", "svelte-1te3to");
    			add_location(label1, file$6, 80, 4, 2788);
    			attr_dev(input0, "class", "slider svelte-1te3to");
    			attr_dev(input0, "id", "generationLength");
    			attr_dev(input0, "type", "range");
    			attr_dev(input0, "min", "20");
    			attr_dev(input0, "max", "1000");
    			attr_dev(input0, "step", "10");
    			add_location(input0, file$6, 81, 4, 2849);
    			attr_dev(span, "class", "svelte-1te3to");
    			add_location(span, file$6, 89, 6, 3019);
    			attr_dev(div1, "class", "optionElement svelte-1te3to");
    			add_location(div1, file$6, 79, 2, 2756);
    			attr_dev(label2, "class", "svelte-1te3to");
    			add_location(label2, file$6, 92, 2, 3069);
    			attr_dev(label3, "for", "autoRequest");
    			attr_dev(label3, "class", "svelte-1te3to");
    			add_location(label3, file$6, 98, 4, 3227);
    			attr_dev(input1, "id", "autoRequest");
    			attr_dev(input1, "type", "checkbox");
    			attr_dev(input1, "class", "svelte-1te3to");
    			add_location(input1, file$6, 99, 4, 3277);
    			attr_dev(div2, "class", "optionElement svelte-1te3to");
    			add_location(div2, file$6, 97, 2, 3195);
    			attr_dev(div3, "class", "options svelte-1te3to");
    			add_location(div3, file$6, 68, 0, 2463);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, h1);
    			append_dev(div3, t1);
    			append_dev(div3, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t3);
    			append_dev(div0, select);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(select, null);
    			}

    			select_option(select, /*$genreStore*/ ctx[0]);
    			append_dev(div3, t4);
    			append_dev(div3, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t6);
    			append_dev(div1, input0);
    			set_input_value(input0, /*$generationLengthStore*/ ctx[1]);
    			append_dev(div1, t7);
    			append_dev(div1, span);
    			append_dev(span, t8);
    			append_dev(div3, t9);
    			append_dev(div3, label2);
    			append_dev(div3, t11);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			append_dev(div3, t12);
    			append_dev(div3, div2);
    			append_dev(div2, label3);
    			append_dev(div2, t14);
    			append_dev(div2, input1);
    			input1.checked = /*$autoRequestStore*/ ctx[2];
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(select, "change", /*select_change_handler*/ ctx[3]),
    				listen_dev(input0, "change", /*input0_change_input_handler*/ ctx[4]),
    				listen_dev(input0, "input", /*input0_change_input_handler*/ ctx[4]),
    				listen_dev(input1, "change", /*input1_change_handler*/ ctx[5])
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*genres*/ 0) {
    				each_value_1 = genres;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*$genreStore*/ 1) {
    				select_option(select, /*$genreStore*/ ctx[0]);
    			}

    			if (dirty & /*$generationLengthStore*/ 2) {
    				set_input_value(input0, /*$generationLengthStore*/ ctx[1]);
    			}

    			if (!current || dirty & /*$generationLengthStore*/ 2) set_data_dev(t8, /*$generationLengthStore*/ ctx[1]);

    			if (dirty & /*instrumentCategories*/ 0) {
    				each_value = instrumentCategories;
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
    						each_blocks[i].m(div3, t12);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*$autoRequestStore*/ 4) {
    				input1.checked = /*$autoRequestStore*/ ctx[2];
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
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
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
    	let $genreStore;
    	let $generationLengthStore;
    	let $autoRequestStore;
    	validate_store(genreStore, "genreStore");
    	component_subscribe($$self, genreStore, $$value => $$invalidate(0, $genreStore = $$value));
    	validate_store(generationLengthStore, "generationLengthStore");
    	component_subscribe($$self, generationLengthStore, $$value => $$invalidate(1, $generationLengthStore = $$value));
    	validate_store(autoRequestStore, "autoRequestStore");
    	component_subscribe($$self, autoRequestStore, $$value => $$invalidate(2, $autoRequestStore = $$value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<GenerationOptions> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("GenerationOptions", $$slots, []);

    	function select_change_handler() {
    		$genreStore = select_value(this);
    		genreStore.set($genreStore);
    	}

    	function input0_change_input_handler() {
    		$generationLengthStore = to_number(this.value);
    		generationLengthStore.set($generationLengthStore);
    	}

    	function input1_change_handler() {
    		$autoRequestStore = this.checked;
    		autoRequestStore.set($autoRequestStore);
    	}

    	$$self.$capture_state = () => ({
    		genreStore,
    		generationLengthStore,
    		instrumentStores,
    		truncationStore,
    		temperatureStore,
    		autoRequestStore,
    		autoScrollStore,
    		yScaleStore,
    		InstrumentCheckbox,
    		genres,
    		instrumentCategories,
    		$genreStore,
    		$generationLengthStore,
    		$autoRequestStore
    	});

    	return [
    		$genreStore,
    		$generationLengthStore,
    		$autoRequestStore,
    		select_change_handler,
    		input0_change_input_handler,
    		input1_change_handler
    	];
    }

    class GenerationOptions extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GenerationOptions",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/TestBench.svelte generated by Svelte v3.21.0 */
    const file$7 = "src/TestBench.svelte";

    function create_fragment$7(ctx) {
    	let label0;
    	let t0;
    	let t1;
    	let t2;
    	let input0;
    	let t3;
    	let label1;
    	let t4;
    	let t5;
    	let t6;
    	let input1;
    	let t7;
    	let button0;
    	let t9;
    	let button1;
    	let dispose;

    	const block = {
    		c: function create() {
    			label0 = element("label");
    			t0 = text("Pitch: ");
    			t1 = text(/*pitch*/ ctx[0]);
    			t2 = space();
    			input0 = element("input");
    			t3 = space();
    			label1 = element("label");
    			t4 = text("Time: ");
    			t5 = text(/*length*/ ctx[2]);
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			button0 = element("button");
    			button0.textContent = "Play";
    			t9 = space();
    			button1 = element("button");
    			button1.textContent = "Play All";
    			attr_dev(input0, "type", "range");
    			attr_dev(input0, "min", "0");
    			attr_dev(input0, "max", "127");
    			add_location(input0, file$7, 55, 4, 2426);
    			add_location(label0, file$7, 53, 0, 2395);
    			attr_dev(input1, "type", "range");
    			attr_dev(input1, "min", "1");
    			attr_dev(input1, "max", "10");
    			add_location(input1, file$7, 60, 4, 2521);
    			add_location(label1, file$7, 58, 0, 2490);
    			add_location(button0, file$7, 63, 0, 2590);
    			add_location(button1, file$7, 64, 0, 2628);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, label0, anchor);
    			append_dev(label0, t0);
    			append_dev(label0, t1);
    			append_dev(label0, t2);
    			append_dev(label0, input0);
    			set_input_value(input0, /*pitch*/ ctx[0]);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, label1, anchor);
    			append_dev(label1, t4);
    			append_dev(label1, t5);
    			append_dev(label1, t6);
    			append_dev(label1, input1);
    			set_input_value(input1, /*lengthInput*/ ctx[1]);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, button1, anchor);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "change", /*input0_change_input_handler*/ ctx[4]),
    				listen_dev(input0, "input", /*input0_change_input_handler*/ ctx[4]),
    				listen_dev(input1, "change", /*input1_change_input_handler*/ ctx[5]),
    				listen_dev(input1, "input", /*input1_change_input_handler*/ ctx[5]),
    				listen_dev(button0, "click", /*play*/ ctx[3], false, false, false),
    				listen_dev(button1, "click", playAll, false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*pitch*/ 1) set_data_dev(t1, /*pitch*/ ctx[0]);

    			if (dirty & /*pitch*/ 1) {
    				set_input_value(input0, /*pitch*/ ctx[0]);
    			}

    			if (dirty & /*length*/ 4) set_data_dev(t5, /*length*/ ctx[2]);

    			if (dirty & /*lengthInput*/ 2) {
    				set_input_value(input1, /*lengthInput*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(label1);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(button1);
    			run_all(dispose);
    		}
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

    async function playAll() {
    	const ctx = new AudioContext();
    	const gain = ctx.createGain();
    	gain.gain.value = 0.1;
    	gain.connect(ctx.destination);
    	const reverb = ctx.createConvolver();

    	// reverb.buffer = impulseResponse(ctx, 10, 100);
    	reverb.connect(gain);

    	const mixer = ctx.createGain();
    	mixer.gain.value = 1;
    	mixer.connect(reverb);
    	mixer.connect(gain);
    	const synth = new Piano();
    	await ctx.suspend();
    	const encoding = "816 823 831 835 4095 4095 48 55 63 67 3969 816 823 831 840 4010 48 55 63 72 3978 816 823 833 839 4011 48 55 65 71 3978 816 823 831 840 4010 48 55 63 72 3978 816 823 827 842 4055 55 59 74 3988 825 828 835 4011 48 57 60 67 3978 823 827 830 835 4010 55 59 62 67 3978 816 828 831 836 4055 60 63 68 3989 824 828 831 4010 48 4011 56 60 63 3988 811 823 827 830 4095 3984 43 55 59 62 4035 816 823 831 835 4095 3984 48 55 63 67 4012 816 823 831 840 4011 48 55 63 72 3978 816 823 833 839 4010 48 55 65 71 3978 816 823 831 840 4011 48 55 63 72 3978 816 826 832 842 4010 58 64 3978 821 833 3999 74 3978 53 65 3978 825 831 840 4010 57 63 72 3978 821 831 833 3978 48 3999 53 63 65 3978 816 826 830 835 4010 58 62 3978 823 831 3999 48 67 3978 55 63 3978 809 821 831 837 4010 69 3978 1096 4000 41 53 63 3977 72 3978 814 821 958 968 4055 46 53 62 72 3989 819 823 835 838 4055 51 55 67 70 3988";
    	let audioNotes = decode(encoding.split(" ").map(it => parseInt(it)));
    	await synth.schedule(ctx, mixer, audioNotes);
    	await ctx.resume();
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let pitch = 60;
    	let lengthInput = 5;

    	async function play() {
    		const ctx = new AudioContext();
    		const synth = new Piano();
    		await ctx.suspend();
    		await synth.setup(ctx, ctx.destination);

    		await synth.loadNote(
    			{
    				volume: 0.5,
    				pitch,
    				startTime: ctx.currentTime,
    				endTime: ctx.currentTime + length
    			},
    			ctx,
    			ctx.destination
    		);

    		await ctx.resume();
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TestBench> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TestBench", $$slots, []);

    	function input0_change_input_handler() {
    		pitch = to_number(this.value);
    		$$invalidate(0, pitch);
    	}

    	function input1_change_input_handler() {
    		lengthInput = to_number(this.value);
    		$$invalidate(1, lengthInput);
    	}

    	$$self.$capture_state = () => ({
    		Piano,
    		decode,
    		pitch,
    		lengthInput,
    		play,
    		playAll,
    		length
    	});

    	$$self.$inject_state = $$props => {
    		if ("pitch" in $$props) $$invalidate(0, pitch = $$props.pitch);
    		if ("lengthInput" in $$props) $$invalidate(1, lengthInput = $$props.lengthInput);
    		if ("length" in $$props) $$invalidate(2, length = $$props.length);
    	};

    	let length;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*lengthInput*/ 2) {
    			 $$invalidate(2, length = 0.01 * Math.pow(2, lengthInput));
    		}
    	};

    	return [
    		pitch,
    		lengthInput,
    		length,
    		play,
    		input0_change_input_handler,
    		input1_change_input_handler
    	];
    }

    class TestBench extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TestBench",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/persistence/PersistenceOptions.svelte generated by Svelte v3.21.0 */
    const file$8 = "src/persistence/PersistenceOptions.svelte";

    function create_fragment$8(ctx) {
    	let div1;
    	let h1;
    	let t1;
    	let div0;
    	let label;
    	let span;
    	let t3;
    	let input;
    	let input_multiple_value;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Persistence";
    			t1 = space();
    			div0 = element("div");
    			label = element("label");
    			span = element("span");
    			span.textContent = "Load";
    			t3 = space();
    			input = element("input");
    			add_location(h1, file$8, 58, 2, 2198);
    			add_location(span, file$8, 66, 6, 2433);
    			attr_dev(input, "id", "upload");
    			attr_dev(input, "type", "file");
    			attr_dev(input, "accept", ".json");
    			input.multiple = input_multiple_value = false;
    			set_style(input, "display", "none");
    			add_location(input, file$8, 67, 6, 2457);
    			attr_dev(label, "for", "upload");
    			add_location(label, file$8, 65, 4, 2406);
    			attr_dev(div0, "class", "row svelte-1fuiv5l");
    			add_location(div0, file$8, 59, 2, 2221);
    			attr_dev(div1, "class", "container svelte-1fuiv5l");
    			add_location(div1, file$8, 57, 0, 2172);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h1);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, label);
    			append_dev(label, span);
    			append_dev(label, t3);
    			append_dev(label, input);
    			if (remount) dispose();
    			dispose = listen_dev(input, "change", load$1, false, false, false);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
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

    function save() {
    	
    } // download(JSON.stringify($trackTreeStore), "save.json");

    function load$1(event) {
    	
    } // reader.readAsText(event.target.files[0]);

    function exportAudio(format) {
    	
    } // downloadAudio($selectedTrackEncodingStore, format, "export");

    function instance$8($$self, $$props, $$invalidate) {
    	const reader = new FileReader();

    	reader.onload = event => {
    		
    	}; // trackTreeStore.set(JSON.parse(event.target.result));

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PersistenceOptions> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("PersistenceOptions", $$slots, []);

    	$$self.$capture_state = () => ({
    		downloadAudio,
    		download,
    		TestBench,
    		save,
    		reader,
    		load: load$1,
    		exportAudio
    	});

    	return [];
    }

    class PersistenceOptions extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PersistenceOptions",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/track/TrackControls.svelte generated by Svelte v3.21.0 */
    const file$9 = "src/track/TrackControls.svelte";

    // (65:4) {:else}
    function create_else_block$1(ctx) {
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Play";
    			attr_dev(button, "class", "svelte-hcns81");
    			add_location(button, file$9, 65, 8, 2680);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(65:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (63:51) 
    function create_if_block_1$1(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Play";
    			button.disabled = true;
    			attr_dev(button, "class", "svelte-hcns81");
    			add_location(button, file$9, 63, 8, 2629);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(63:51) ",
    		ctx
    	});

    	return block;
    }

    // (61:4) {#if $audioStatusStore.type === "on"}
    function create_if_block$2(ctx) {
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Stop";
    			attr_dev(button, "class", "svelte-hcns81");
    			add_location(button, file$9, 61, 8, 2531);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", stop, false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(61:4) {#if $audioStatusStore.type === \\\"on\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div4;
    	let t0;
    	let div0;
    	let label0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let input0;
    	let t5;
    	let div1;
    	let label1;
    	let t7;
    	let input1;
    	let t8;
    	let div2;
    	let label2;
    	let t9;
    	let t10;
    	let t11;
    	let t12;
    	let input2;
    	let t13;
    	let div3;
    	let label3;
    	let t15;
    	let input3;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*$audioStatusStore*/ ctx[0].type === "on") return create_if_block$2;
    		if (/*$audioStatusStore*/ ctx[0].type === "loading") return create_if_block_1$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			if_block.c();
    			t0 = space();
    			div0 = element("div");
    			label0 = element("label");
    			t1 = text("Pre-Play: ");
    			t2 = text(/*$preplayStore*/ ctx[1]);
    			t3 = text("s");
    			t4 = space();
    			input0 = element("input");
    			t5 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Auto Scroll";
    			t7 = space();
    			input1 = element("input");
    			t8 = space();
    			div2 = element("div");
    			label2 = element("label");
    			t9 = text("Zoom: ");
    			t10 = text(/*$yScaleStore*/ ctx[3]);
    			t11 = text("%");
    			t12 = space();
    			input2 = element("input");
    			t13 = space();
    			div3 = element("div");
    			label3 = element("label");
    			label3.textContent = "Auto Play";
    			t15 = space();
    			input3 = element("input");
    			attr_dev(label0, "for", "preplay");
    			attr_dev(label0, "class", "svelte-hcns81");
    			add_location(label0, file$9, 69, 8, 2775);
    			attr_dev(input0, "class", "slider svelte-hcns81");
    			attr_dev(input0, "id", "preplay");
    			attr_dev(input0, "type", "range");
    			attr_dev(input0, "min", "0");
    			attr_dev(input0, "max", "5");
    			attr_dev(input0, "step", "0.5");
    			add_location(input0, file$9, 70, 8, 2839);
    			attr_dev(div0, "class", "col margin svelte-hcns81");
    			add_location(div0, file$9, 68, 4, 2742);
    			attr_dev(label1, "for", "autoScroll");
    			attr_dev(label1, "class", "svelte-hcns81");
    			add_location(label1, file$9, 74, 8, 2999);
    			attr_dev(input1, "id", "autoScroll");
    			attr_dev(input1, "type", "checkbox");
    			add_location(input1, file$9, 75, 8, 3051);
    			attr_dev(div1, "class", "col center margin svelte-hcns81");
    			add_location(div1, file$9, 73, 4, 2959);
    			attr_dev(label2, "for", "yScale");
    			attr_dev(label2, "class", "svelte-hcns81");
    			add_location(label2, file$9, 79, 8, 3173);
    			attr_dev(input2, "class", "slider svelte-hcns81");
    			attr_dev(input2, "id", "yScale");
    			attr_dev(input2, "type", "range");
    			attr_dev(input2, "min", "10");
    			attr_dev(input2, "max", "500");
    			attr_dev(input2, "step", "10");
    			add_location(input2, file$9, 80, 8, 3231);
    			attr_dev(div2, "class", "col margin svelte-hcns81");
    			add_location(div2, file$9, 78, 4, 3140);
    			attr_dev(label3, "for", "autoPlay");
    			attr_dev(label3, "class", "svelte-hcns81");
    			add_location(label3, file$9, 84, 8, 3391);
    			attr_dev(input3, "id", "autoPlay");
    			attr_dev(input3, "type", "checkbox");
    			add_location(input3, file$9, 85, 8, 3439);
    			attr_dev(div3, "class", "col center margin svelte-hcns81");
    			add_location(div3, file$9, 83, 4, 3351);
    			attr_dev(div4, "class", "container row center svelte-hcns81");
    			add_location(div4, file$9, 59, 0, 2446);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div4, anchor);
    			if_block.m(div4, null);
    			append_dev(div4, t0);
    			append_dev(div4, div0);
    			append_dev(div0, label0);
    			append_dev(label0, t1);
    			append_dev(label0, t2);
    			append_dev(label0, t3);
    			append_dev(div0, t4);
    			append_dev(div0, input0);
    			set_input_value(input0, /*$preplayStore*/ ctx[1]);
    			append_dev(div4, t5);
    			append_dev(div4, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t7);
    			append_dev(div1, input1);
    			input1.checked = /*$autoScrollStore*/ ctx[2];
    			append_dev(div4, t8);
    			append_dev(div4, div2);
    			append_dev(div2, label2);
    			append_dev(label2, t9);
    			append_dev(label2, t10);
    			append_dev(label2, t11);
    			append_dev(div2, t12);
    			append_dev(div2, input2);
    			set_input_value(input2, /*$yScaleStore*/ ctx[3]);
    			append_dev(div4, t13);
    			append_dev(div4, div3);
    			append_dev(div3, label3);
    			append_dev(div3, t15);
    			append_dev(div3, input3);
    			input3.checked = /*$autoPlayStore*/ ctx[4];
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "change", /*input0_change_input_handler*/ ctx[6]),
    				listen_dev(input0, "input", /*input0_change_input_handler*/ ctx[6]),
    				listen_dev(input1, "change", /*input1_change_handler*/ ctx[7]),
    				listen_dev(input2, "change", /*input2_change_input_handler*/ ctx[8]),
    				listen_dev(input2, "input", /*input2_change_input_handler*/ ctx[8]),
    				listen_dev(input3, "change", /*input3_change_handler*/ ctx[9])
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div4, t0);
    				}
    			}

    			if (dirty & /*$preplayStore*/ 2) set_data_dev(t2, /*$preplayStore*/ ctx[1]);

    			if (dirty & /*$preplayStore*/ 2) {
    				set_input_value(input0, /*$preplayStore*/ ctx[1]);
    			}

    			if (dirty & /*$autoScrollStore*/ 4) {
    				input1.checked = /*$autoScrollStore*/ ctx[2];
    			}

    			if (dirty & /*$yScaleStore*/ 8) set_data_dev(t10, /*$yScaleStore*/ ctx[3]);

    			if (dirty & /*$yScaleStore*/ 8) {
    				set_input_value(input2, /*$yScaleStore*/ ctx[3]);
    			}

    			if (dirty & /*$autoPlayStore*/ 16) {
    				input3.checked = /*$autoPlayStore*/ ctx[4];
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if_block.d();
    			run_all(dispose);
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
    	let $audioStatusStore;
    	let $preplayStore;
    	let $autoScrollStore;
    	let $yScaleStore;
    	let $autoPlayStore;
    	validate_store(audioStatusStore, "audioStatusStore");
    	component_subscribe($$self, audioStatusStore, $$value => $$invalidate(0, $audioStatusStore = $$value));
    	validate_store(preplayStore, "preplayStore");
    	component_subscribe($$self, preplayStore, $$value => $$invalidate(1, $preplayStore = $$value));
    	validate_store(autoScrollStore, "autoScrollStore");
    	component_subscribe($$self, autoScrollStore, $$value => $$invalidate(2, $autoScrollStore = $$value));
    	validate_store(yScaleStore, "yScaleStore");
    	component_subscribe($$self, yScaleStore, $$value => $$invalidate(3, $yScaleStore = $$value));
    	validate_store(autoPlayStore, "autoPlayStore");
    	component_subscribe($$self, autoPlayStore, $$value => $$invalidate(4, $autoPlayStore = $$value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TrackControls> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TrackControls", $$slots, []);
    	const click_handler = () => play(0);

    	function input0_change_input_handler() {
    		$preplayStore = to_number(this.value);
    		preplayStore.set($preplayStore);
    	}

    	function input1_change_handler() {
    		$autoScrollStore = this.checked;
    		autoScrollStore.set($autoScrollStore);
    	}

    	function input2_change_input_handler() {
    		$yScaleStore = to_number(this.value);
    		yScaleStore.set($yScaleStore);
    	}

    	function input3_change_handler() {
    		$autoPlayStore = this.checked;
    		autoPlayStore.set($autoPlayStore);
    	}

    	$$self.$capture_state = () => ({
    		preplayStore,
    		autoScrollStore,
    		yScaleStore,
    		autoPlayStore,
    		play,
    		stop,
    		audioStatusStore,
    		$audioStatusStore,
    		$preplayStore,
    		$autoScrollStore,
    		$yScaleStore,
    		$autoPlayStore
    	});

    	return [
    		$audioStatusStore,
    		$preplayStore,
    		$autoScrollStore,
    		$yScaleStore,
    		$autoPlayStore,
    		click_handler,
    		input0_change_input_handler,
    		input1_change_handler,
    		input2_change_input_handler,
    		input3_change_handler
    	];
    }

    class TrackControls extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TrackControls",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /**
     * This module used to unify mouse wheel behavior between different browsers in 2014
     * Now it's just a wrapper around addEventListener('wheel');
     *
     * Usage:
     *  var addWheelListener = require('wheel').addWheelListener;
     *  var removeWheelListener = require('wheel').removeWheelListener;
     *  addWheelListener(domElement, function (e) {
     *    // mouse wheel event
     *  });
     *  removeWheelListener(domElement, function);
     */

    var wheel = addWheelListener;

    // But also expose "advanced" api with unsubscribe:
    var addWheelListener_1 = addWheelListener;
    var removeWheelListener_1 = removeWheelListener;


    function addWheelListener(element, listener, useCapture) {
      element.addEventListener('wheel', listener, useCapture);
    }

    function removeWheelListener( element, listener, useCapture ) {
      element.removeEventListener('wheel', listener, useCapture);
    }
    wheel.addWheelListener = addWheelListener_1;
    wheel.removeWheelListener = removeWheelListener_1;

    /**
     * https://github.com/gre/bezier-easing
     * BezierEasing - use bezier curve for transition easing function
     * by Gaëtan Renaudeau 2014 - 2015 – MIT License
     */

    // These values are established by empiricism with tests (tradeoff: performance VS precision)
    var NEWTON_ITERATIONS = 4;
    var NEWTON_MIN_SLOPE = 0.001;
    var SUBDIVISION_PRECISION = 0.0000001;
    var SUBDIVISION_MAX_ITERATIONS = 10;

    var kSplineTableSize = 11;
    var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

    var float32ArraySupported = typeof Float32Array === 'function';

    function A (aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
    function B (aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; }
    function C (aA1)      { return 3.0 * aA1; }

    // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
    function calcBezier (aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT; }

    // Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
    function getSlope (aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1); }

    function binarySubdivide (aX, aA, aB, mX1, mX2) {
      var currentX, currentT, i = 0;
      do {
        currentT = aA + (aB - aA) / 2.0;
        currentX = calcBezier(currentT, mX1, mX2) - aX;
        if (currentX > 0.0) {
          aB = currentT;
        } else {
          aA = currentT;
        }
      } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
      return currentT;
    }

    function newtonRaphsonIterate (aX, aGuessT, mX1, mX2) {
     for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
       var currentSlope = getSlope(aGuessT, mX1, mX2);
       if (currentSlope === 0.0) {
         return aGuessT;
       }
       var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
       aGuessT -= currentX / currentSlope;
     }
     return aGuessT;
    }

    function LinearEasing (x) {
      return x;
    }

    var src = function bezier (mX1, mY1, mX2, mY2) {
      if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
        throw new Error('bezier x values must be in [0, 1] range');
      }

      if (mX1 === mY1 && mX2 === mY2) {
        return LinearEasing;
      }

      // Precompute samples table
      var sampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
      for (var i = 0; i < kSplineTableSize; ++i) {
        sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
      }

      function getTForX (aX) {
        var intervalStart = 0.0;
        var currentSample = 1;
        var lastSample = kSplineTableSize - 1;

        for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
          intervalStart += kSampleStepSize;
        }
        --currentSample;

        // Interpolate to provide an initial guess for t
        var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
        var guessForT = intervalStart + dist * kSampleStepSize;

        var initialSlope = getSlope(guessForT, mX1, mX2);
        if (initialSlope >= NEWTON_MIN_SLOPE) {
          return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
        } else if (initialSlope === 0.0) {
          return guessForT;
        } else {
          return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
        }
      }

      return function BezierEasing (x) {
        // Because JavaScript number are imprecise, we should guarantee the extremes are right.
        if (x === 0) {
          return 0;
        }
        if (x === 1) {
          return 1;
        }
        return calcBezier(getTForX(x), mY1, mY2);
      };
    };

    // Predefined set of animations. Similar to CSS easing functions
    var animations = {
      ease:  src(0.25, 0.1, 0.25, 1),
      easeIn: src(0.42, 0, 1, 1),
      easeOut: src(0, 0, 0.58, 1),
      easeInOut: src(0.42, 0, 0.58, 1),
      linear: src(0, 0, 1, 1)
    };


    var amator = animate;
    var makeAggregateRaf_1 = makeAggregateRaf;
    var sharedScheduler = makeAggregateRaf();


    function animate(source, target, options) {
      var start = Object.create(null);
      var diff = Object.create(null);
      options = options || {};
      // We let clients specify their own easing function
      var easing = (typeof options.easing === 'function') ? options.easing : animations[options.easing];

      // if nothing is specified, default to ease (similar to CSS animations)
      if (!easing) {
        if (options.easing) {
          console.warn('Unknown easing function in amator: ' + options.easing);
        }
        easing = animations.ease;
      }

      var step = typeof options.step === 'function' ? options.step : noop$2;
      var done = typeof options.done === 'function' ? options.done : noop$2;

      var scheduler = getScheduler(options.scheduler);

      var keys = Object.keys(target);
      keys.forEach(function(key) {
        start[key] = source[key];
        diff[key] = target[key] - source[key];
      });

      var durationInMs = typeof options.duration === 'number' ? options.duration : 400;
      var durationInFrames = Math.max(1, durationInMs * 0.06); // 0.06 because 60 frames pers 1,000 ms
      var previousAnimationId;
      var frame = 0;

      previousAnimationId = scheduler.next(loop);

      return {
        cancel: cancel
      }

      function cancel() {
        scheduler.cancel(previousAnimationId);
        previousAnimationId = 0;
      }

      function loop() {
        var t = easing(frame/durationInFrames);
        frame += 1;
        setValues(t);
        if (frame <= durationInFrames) {
          previousAnimationId = scheduler.next(loop);
          step(source);
        } else {
          previousAnimationId = 0;
          setTimeout(function() { done(source); }, 0);
        }
      }

      function setValues(t) {
        keys.forEach(function(key) {
          source[key] = diff[key] * t + start[key];
        });
      }
    }

    function noop$2() { }

    function getScheduler(scheduler) {
      if (!scheduler) {
        var canRaf = typeof window !== 'undefined' && window.requestAnimationFrame;
        return canRaf ? rafScheduler() : timeoutScheduler()
      }
      if (typeof scheduler.next !== 'function') throw new Error('Scheduler is supposed to have next(cb) function')
      if (typeof scheduler.cancel !== 'function') throw new Error('Scheduler is supposed to have cancel(handle) function')

      return scheduler
    }

    function rafScheduler() {
      return {
        next: window.requestAnimationFrame.bind(window),
        cancel: window.cancelAnimationFrame.bind(window)
      }
    }

    function timeoutScheduler() {
      return {
        next: function(cb) {
          return setTimeout(cb, 1000/60)
        },
        cancel: function (id) {
          return clearTimeout(id)
        }
      }
    }

    function makeAggregateRaf() {
      var frontBuffer = new Set();
      var backBuffer = new Set();
      var frameToken = 0;

      return {
        next: next,
        cancel: next,
        clearAll: clearAll
      }

      function clearAll() {
        frontBuffer.clear();
        backBuffer.clear();
        cancelAnimationFrame(frameToken);
        frameToken = 0;
      }

      function next(callback) {
        backBuffer.add(callback);
        renderNextFrame();
      }

      function renderNextFrame() {
        if (!frameToken) frameToken = requestAnimationFrame(renderFrame);
      }

      function renderFrame() {
        frameToken = 0;

        var t = backBuffer;
        backBuffer = frontBuffer;
        frontBuffer = t;

        frontBuffer.forEach(function(callback) {
          callback();
        });
        frontBuffer.clear();
      }
    }
    amator.makeAggregateRaf = makeAggregateRaf_1;
    amator.sharedScheduler = sharedScheduler;

    var ngraph_events = function eventify(subject) {
      validateSubject(subject);

      var eventsStorage = createEventsStorage(subject);
      subject.on = eventsStorage.on;
      subject.off = eventsStorage.off;
      subject.fire = eventsStorage.fire;
      return subject;
    };

    function createEventsStorage(subject) {
      // Store all event listeners to this hash. Key is event name, value is array
      // of callback records.
      //
      // A callback record consists of callback function and its optional context:
      // { 'eventName' => [{callback: function, ctx: object}] }
      var registeredEvents = Object.create(null);

      return {
        on: function (eventName, callback, ctx) {
          if (typeof callback !== 'function') {
            throw new Error('callback is expected to be a function');
          }
          var handlers = registeredEvents[eventName];
          if (!handlers) {
            handlers = registeredEvents[eventName] = [];
          }
          handlers.push({callback: callback, ctx: ctx});

          return subject;
        },

        off: function (eventName, callback) {
          var wantToRemoveAll = (typeof eventName === 'undefined');
          if (wantToRemoveAll) {
            // Killing old events storage should be enough in this case:
            registeredEvents = Object.create(null);
            return subject;
          }

          if (registeredEvents[eventName]) {
            var deleteAllCallbacksForEvent = (typeof callback !== 'function');
            if (deleteAllCallbacksForEvent) {
              delete registeredEvents[eventName];
            } else {
              var callbacks = registeredEvents[eventName];
              for (var i = 0; i < callbacks.length; ++i) {
                if (callbacks[i].callback === callback) {
                  callbacks.splice(i, 1);
                }
              }
            }
          }

          return subject;
        },

        fire: function (eventName) {
          var callbacks = registeredEvents[eventName];
          if (!callbacks) {
            return subject;
          }

          var fireArguments;
          if (arguments.length > 1) {
            fireArguments = Array.prototype.splice.call(arguments, 1);
          }
          for(var i = 0; i < callbacks.length; ++i) {
            var callbackInfo = callbacks[i];
            callbackInfo.callback.apply(callbackInfo.ctx, fireArguments);
          }

          return subject;
        }
      };
    }

    function validateSubject(subject) {
      if (!subject) {
        throw new Error('Eventify cannot use falsy object as events subject');
      }
      var reservedWords = ['on', 'fire', 'off'];
      for (var i = 0; i < reservedWords.length; ++i) {
        if (subject.hasOwnProperty(reservedWords[i])) {
          throw new Error("Subject cannot be eventified, since it already has property '" + reservedWords[i] + "'");
        }
      }
    }

    /**
     * Allows smooth kinetic scrolling of the surface
     */
    var kinetic_1 = kinetic;

    function kinetic(getPoint, scroll, settings) {
      if (typeof settings !== 'object') {
        // setting could come as boolean, we should ignore it, and use an object.
        settings = {};
      }

      var minVelocity = typeof settings.minVelocity === 'number' ? settings.minVelocity : 5;
      var amplitude = typeof settings.amplitude === 'number' ? settings.amplitude : 0.25;
      var cancelAnimationFrame = typeof settings.cancelAnimationFrame === 'function' ? settings.cancelAnimationFrame : getCancelAnimationFrame();
      var requestAnimationFrame = typeof settings.requestAnimationFrame === 'function' ? settings.requestAnimationFrame : getRequestAnimationFrame();

      var lastPoint;
      var timestamp;
      var timeConstant = 342;

      var ticker;
      var vx, targetX, ax;
      var vy, targetY, ay;

      var raf;

      return {
        start: start,
        stop: stop,
        cancel: dispose
      };

      function dispose() {
        cancelAnimationFrame(ticker);
        cancelAnimationFrame(raf);
      }

      function start() {
        lastPoint = getPoint();

        ax = ay = vx = vy = 0;
        timestamp = new Date();

        cancelAnimationFrame(ticker);
        cancelAnimationFrame(raf);

        // we start polling the point position to accumulate velocity
        // Once we stop(), we will use accumulated velocity to keep scrolling
        // an object.
        ticker = requestAnimationFrame(track);
      }

      function track() {
        var now = Date.now();
        var elapsed = now - timestamp;
        timestamp = now;

        var currentPoint = getPoint();

        var dx = currentPoint.x - lastPoint.x;
        var dy = currentPoint.y - lastPoint.y;

        lastPoint = currentPoint;

        var dt = 1000 / (1 + elapsed);

        // moving average
        vx = 0.8 * dx * dt + 0.2 * vx;
        vy = 0.8 * dy * dt + 0.2 * vy;

        ticker = requestAnimationFrame(track);
      }

      function stop() {
        cancelAnimationFrame(ticker);
        cancelAnimationFrame(raf);

        var currentPoint = getPoint();

        targetX = currentPoint.x;
        targetY = currentPoint.y;
        timestamp = Date.now();

        if (vx < -minVelocity || vx > minVelocity) {
          ax = amplitude * vx;
          targetX += ax;
        }

        if (vy < -minVelocity || vy > minVelocity) {
          ay = amplitude * vy;
          targetY += ay;
        }

        raf = requestAnimationFrame(autoScroll);
      }

      function autoScroll() {
        var elapsed = Date.now() - timestamp;

        var moving = false;
        var dx = 0;
        var dy = 0;

        if (ax) {
          dx = -ax * Math.exp(-elapsed / timeConstant);

          if (dx > 0.5 || dx < -0.5) moving = true;
          else dx = ax = 0;
        }

        if (ay) {
          dy = -ay * Math.exp(-elapsed / timeConstant);

          if (dy > 0.5 || dy < -0.5) moving = true;
          else dy = ay = 0;
        }

        if (moving) {
          scroll(targetX + dx, targetY + dy);
          raf = requestAnimationFrame(autoScroll);
        }
      }
    }

    function getCancelAnimationFrame() {
      if (typeof commonjsGlobal.cancelAnimationFrame === 'function') return commonjsGlobal.cancelAnimationFrame;

      return clearTimeout;
    }

    function getRequestAnimationFrame() {
      if (typeof commonjsGlobal.requestAnimationFrame === 'function') return commonjsGlobal.requestAnimationFrame;

      return function (handler) {
        return setTimeout(handler, 16);
      }
    }

    /**
     * Disallows selecting text.
     */
    var createTextSelectionInterceptor_1 = createTextSelectionInterceptor;

    function createTextSelectionInterceptor(useFake) {
      if (useFake) {
        return {
          capture: noop$3,
          release: noop$3
        };
      }

      var dragObject;
      var prevSelectStart;
      var prevDragStart;
      var wasCaptured = false;

      return {
        capture: capture,
        release: release
      };

      function capture(domObject) {
        wasCaptured = true;
        prevSelectStart = window.document.onselectstart;
        prevDragStart = window.document.ondragstart;

        window.document.onselectstart = disabled;

        dragObject = domObject;
        dragObject.ondragstart = disabled;
      }

      function release() {
        if (!wasCaptured) return;
        
        wasCaptured = false;
        window.document.onselectstart = prevSelectStart;
        if (dragObject) dragObject.ondragstart = prevDragStart;
      }
    }

    function disabled(e) {
      e.stopPropagation();
      return false;
    }

    function noop$3() {}

    var transform = Transform;

    function Transform() {
      this.x = 0;
      this.y = 0;
      this.scale = 1;
    }

    var svgController = makeSvgController;
    var canAttach = isSVGElement;

    function makeSvgController(svgElement, options) {
      if (!isSVGElement(svgElement)) {
        throw new Error('svg element is required for svg.panzoom to work')
      }

      var owner = svgElement.ownerSVGElement;
      if (!owner) {
        throw new Error(
          'Do not apply panzoom to the root <svg> element. ' +
          'Use its child instead (e.g. <g></g>). ' +
          'As of March 2016 only FireFox supported transform on the root element')
      }

      if (!options.disableKeyboardInteraction) {
        owner.setAttribute('tabindex', 0);
      }

      var api = {
        getBBox: getBBox,
        getScreenCTM: getScreenCTM,
        getOwner: getOwner,
        applyTransform: applyTransform,
        initTransform: initTransform
      };
      
      return api

      function getOwner() {
        return owner
      }

      function getBBox() {
        var bbox =  svgElement.getBBox();
        return {
          left: bbox.x,
          top: bbox.y,
          width: bbox.width,
          height: bbox.height,
        }
      }

      function getScreenCTM() {
        var ctm = owner.getCTM();
        if (!ctm) {
          // This is likely firefox: https://bugzilla.mozilla.org/show_bug.cgi?id=873106
          // The code below is not entirely correct, but still better than nothing
          return owner.getScreenCTM();
        }
        return ctm;
      }

      function initTransform(transform) {
        var screenCTM = svgElement.getCTM();
        transform.x = screenCTM.e;
        transform.y = screenCTM.f;
        transform.scale = screenCTM.a;
        owner.removeAttributeNS(null, 'viewBox');
      }

      function applyTransform(transform) {
        svgElement.setAttribute('transform', 'matrix(' +
          transform.scale + ' 0 0 ' +
          transform.scale + ' ' +
          transform.x + ' ' + transform.y + ')');
      }
    }

    function isSVGElement(element) {
      return element && element.ownerSVGElement && element.getCTM;
    }
    svgController.canAttach = canAttach;

    var domController = makeDomController;

    var canAttach$1 = isDomElement;

    function makeDomController(domElement, options) {
      var elementValid = isDomElement(domElement); 
      if (!elementValid) {
        throw new Error('panzoom requires DOM element to be attached to the DOM tree')
      }

      var owner = domElement.parentElement;
      domElement.scrollTop = 0;
      
      if (!options.disableKeyboardInteraction) {
        owner.setAttribute('tabindex', 0);
      }

      var api = {
        getBBox: getBBox,
        getOwner: getOwner,
        applyTransform: applyTransform,
      };
      
      return api

      function getOwner() {
        return owner
      }

      function getBBox() {
        // TODO: We should probably cache this?
        return  {
          left: 0,
          top: 0,
          width: domElement.clientWidth,
          height: domElement.clientHeight
        }
      }

      function applyTransform(transform) {
        // TODO: Should we cache this?
        domElement.style.transformOrigin = '0 0 0';
        domElement.style.transform = 'matrix(' +
          transform.scale + ', 0, 0, ' +
          transform.scale + ', ' +
          transform.x + ', ' + transform.y + ')';
      }
    }

    function isDomElement(element) {
      return element && element.parentElement && element.style;
    }
    domController.canAttach = canAttach$1;

    /**
     * Allows to drag and zoom svg elements
     */





    var domTextSelectionInterceptor = createTextSelectionInterceptor_1();
    var fakeTextSelectorInterceptor = createTextSelectionInterceptor_1(true);




    var defaultZoomSpeed = 1;
    var defaultDoubleTapZoomSpeed = 1.75;
    var doubleTapSpeedInMS = 300;

    var panzoom = createPanZoom;

    /**
     * Creates a new instance of panzoom, so that an object can be panned and zoomed
     *
     * @param {DOMElement} domElement where panzoom should be attached.
     * @param {Object} options that configure behavior.
     */
    function createPanZoom(domElement, options) {
      options = options || {};

      var panController = options.controller;

      if (!panController) {
        if (svgController.canAttach(domElement)) {
          panController = svgController(domElement, options);
        } else if (domController.canAttach(domElement)) {
          panController = domController(domElement, options);
        }
      }

      if (!panController) {
        throw new Error(
          'Cannot create panzoom for the current type of dom element'
        );
      }
      var owner = panController.getOwner();
      // just to avoid GC pressure, every time we do intermediate transform
      // we return this object. For internal use only. Never give it back to the consumer of this library
      var storedCTMResult = { x: 0, y: 0 };

      var isDirty = false;
      var transform$1 = new transform();

      if (panController.initTransform) {
        panController.initTransform(transform$1);
      }

      var filterKey = typeof options.filterKey === 'function' ? options.filterKey : noop$4;
      // TODO: likely need to unite pinchSpeed with zoomSpeed
      var pinchSpeed = typeof options.pinchSpeed === 'number' ? options.pinchSpeed : 1;
      var bounds = options.bounds;
      var maxZoom = typeof options.maxZoom === 'number' ? options.maxZoom : Number.POSITIVE_INFINITY;
      var minZoom = typeof options.minZoom === 'number' ? options.minZoom : 0;

      var boundsPadding = typeof options.boundsPadding === 'number' ? options.boundsPadding : 0.05;
      var zoomDoubleClickSpeed = typeof options.zoomDoubleClickSpeed === 'number' ? options.zoomDoubleClickSpeed : defaultDoubleTapZoomSpeed;
      var beforeWheel = options.beforeWheel || noop$4;
      var beforeMouseDown = options.beforeMouseDown || noop$4;
      var speed = typeof options.zoomSpeed === 'number' ? options.zoomSpeed : defaultZoomSpeed;
      var transformOrigin = parseTransformOrigin(options.transformOrigin);
      var textSelection = options.enableTextSelection ? fakeTextSelectorInterceptor : domTextSelectionInterceptor;

      validateBounds(bounds);

      if (options.autocenter) {
        autocenter();
      }

      var frameAnimation;
      var lastTouchEndTime = 0;
      var lastSingleFingerOffset;
      var touchInProgress = false;

      // We only need to fire panstart when actual move happens
      var panstartFired = false;

      // cache mouse coordinates here
      var mouseX;
      var mouseY;

      var pinchZoomLength;

      var smoothScroll;
      if ('smoothScroll' in options && !options.smoothScroll) {
        // If user explicitly asked us not to use smooth scrolling, we obey
        smoothScroll = rigidScroll();
      } else {
        // otherwise we use forward smoothScroll settings to kinetic API
        // which makes scroll smoothing.
        smoothScroll = kinetic_1(getPoint, scroll, options.smoothScroll);
      }

      var moveByAnimation;
      var zoomToAnimation;

      var multiTouch;
      var paused = false;

      listenForEvents();

      var api = {
        dispose: dispose,
        moveBy: internalMoveBy,
        moveTo: moveTo,
        centerOn: centerOn,
        zoomTo: publicZoomTo,
        zoomAbs: zoomAbs,
        smoothZoom: smoothZoom,
        smoothZoomAbs: smoothZoomAbs,
        showRectangle: showRectangle,

        pause: pause,
        resume: resume,
        isPaused: isPaused,

        getTransform: getTransformModel,

        getMinZoom: getMinZoom,
        setMinZoom: setMinZoom,

        getMaxZoom: getMaxZoom,
        setMaxZoom: setMaxZoom,

        getTransformOrigin: getTransformOrigin,
        setTransformOrigin: setTransformOrigin,

        getZoomSpeed: getZoomSpeed,
        setZoomSpeed: setZoomSpeed
      };

      ngraph_events(api);

      return api;

      function pause() {
        releaseEvents();
        paused = true;
      }

      function resume() {
        if (paused) {
          listenForEvents();
          paused = false;
        }
      }

      function isPaused() {
        return paused;
      }

      function showRectangle(rect) {
        // TODO: this duplicates autocenter. I think autocenter should go.
        var clientRect = owner.getBoundingClientRect();
        var size = transformToScreen(clientRect.width, clientRect.height);

        var rectWidth = rect.right - rect.left;
        var rectHeight = rect.bottom - rect.top;
        if (!Number.isFinite(rectWidth) || !Number.isFinite(rectHeight)) {
          throw new Error('Invalid rectangle');
        }

        var dw = size.x / rectWidth;
        var dh = size.y / rectHeight;
        var scale = Math.min(dw, dh);
        transform$1.x = -(rect.left + rectWidth / 2) * scale + size.x / 2;
        transform$1.y = -(rect.top + rectHeight / 2) * scale + size.y / 2;
        transform$1.scale = scale;
      }

      function transformToScreen(x, y) {
        if (panController.getScreenCTM) {
          var parentCTM = panController.getScreenCTM();
          var parentScaleX = parentCTM.a;
          var parentScaleY = parentCTM.d;
          var parentOffsetX = parentCTM.e;
          var parentOffsetY = parentCTM.f;
          storedCTMResult.x = x * parentScaleX - parentOffsetX;
          storedCTMResult.y = y * parentScaleY - parentOffsetY;
        } else {
          storedCTMResult.x = x;
          storedCTMResult.y = y;
        }

        return storedCTMResult;
      }

      function autocenter() {
        var w; // width of the parent
        var h; // height of the parent
        var left = 0;
        var top = 0;
        var sceneBoundingBox = getBoundingBox();
        if (sceneBoundingBox) {
          // If we have bounding box - use it.
          left = sceneBoundingBox.left;
          top = sceneBoundingBox.top;
          w = sceneBoundingBox.right - sceneBoundingBox.left;
          h = sceneBoundingBox.bottom - sceneBoundingBox.top;
        } else {
          // otherwise just use whatever space we have
          var ownerRect = owner.getBoundingClientRect();
          w = ownerRect.width;
          h = ownerRect.height;
        }
        var bbox = panController.getBBox();
        if (bbox.width === 0 || bbox.height === 0) {
          // we probably do not have any elements in the SVG
          // just bail out;
          return;
        }
        var dh = h / bbox.height;
        var dw = w / bbox.width;
        var scale = Math.min(dw, dh);
        transform$1.x = -(bbox.left + bbox.width / 2) * scale + w / 2 + left;
        transform$1.y = -(bbox.top + bbox.height / 2) * scale + h / 2 + top;
        transform$1.scale = scale;
      }

      function getTransformModel() {
        // TODO: should this be read only?
        return transform$1;
      }

      function getMinZoom() {
        return minZoom;
      }

      function setMinZoom(newMinZoom) {
        minZoom = newMinZoom;
      }

      function getMaxZoom() {
        return maxZoom;
      }

      function setMaxZoom(newMaxZoom) {
        maxZoom = newMaxZoom;
      }

      function getTransformOrigin() {
        return transformOrigin;
      }

      function setTransformOrigin(newTransformOrigin) {
        transformOrigin = parseTransformOrigin(newTransformOrigin);
      }

      function getZoomSpeed() {
        return speed;
      }

      function setZoomSpeed(newSpeed) {
        if (!Number.isFinite(newSpeed)) {
          throw new Error('Zoom speed should be a number');
        }
        speed = newSpeed;
      }

      function getPoint() {
        return {
          x: transform$1.x,
          y: transform$1.y
        };
      }

      function moveTo(x, y) {
        transform$1.x = x;
        transform$1.y = y;

        keepTransformInsideBounds();

        triggerEvent('pan');
        makeDirty();
      }

      function moveBy(dx, dy) {
        moveTo(transform$1.x + dx, transform$1.y + dy);
      }

      function keepTransformInsideBounds() {
        var boundingBox = getBoundingBox();
        if (!boundingBox) return;

        var adjusted = false;
        var clientRect = getClientRect();

        var diff = boundingBox.left - clientRect.right;
        if (diff > 0) {
          transform$1.x += diff;
          adjusted = true;
        }
        // check the other side:
        diff = boundingBox.right - clientRect.left;
        if (diff < 0) {
          transform$1.x += diff;
          adjusted = true;
        }

        // y axis:
        diff = boundingBox.top - clientRect.bottom;
        if (diff > 0) {
          // we adjust transform, so that it matches exactly our bounding box:
          // transform.y = boundingBox.top - (boundingBox.height + boundingBox.y) * transform.scale =>
          // transform.y = boundingBox.top - (clientRect.bottom - transform.y) =>
          // transform.y = diff + transform.y =>
          transform$1.y += diff;
          adjusted = true;
        }

        diff = boundingBox.bottom - clientRect.top;
        if (diff < 0) {
          transform$1.y += diff;
          adjusted = true;
        }
        return adjusted;
      }

      /**
       * Returns bounding box that should be used to restrict scene movement.
       */
      function getBoundingBox() {
        if (!bounds) return; // client does not want to restrict movement

        if (typeof bounds === 'boolean') {
          // for boolean type we use parent container bounds
          var ownerRect = owner.getBoundingClientRect();
          var sceneWidth = ownerRect.width;
          var sceneHeight = ownerRect.height;

          return {
            left: sceneWidth * boundsPadding,
            top: sceneHeight * boundsPadding,
            right: sceneWidth * (1 - boundsPadding),
            bottom: sceneHeight * (1 - boundsPadding)
          };
        }

        return bounds;
      }

      function getClientRect() {
        var bbox = panController.getBBox();
        var leftTop = client(bbox.left, bbox.top);

        return {
          left: leftTop.x,
          top: leftTop.y,
          right: bbox.width * transform$1.scale + leftTop.x,
          bottom: bbox.height * transform$1.scale + leftTop.y
        };
      }

      function client(x, y) {
        return {
          x: x * transform$1.scale + transform$1.x,
          y: y * transform$1.scale + transform$1.y
        };
      }

      function makeDirty() {
        isDirty = true;
        frameAnimation = window.requestAnimationFrame(frame);
      }

      function zoomByRatio(clientX, clientY, ratio) {
        if (isNaN$1(clientX) || isNaN$1(clientY) || isNaN$1(ratio)) {
          throw new Error('zoom requires valid numbers');
        }

        var newScale = transform$1.scale * ratio;

        if (newScale < minZoom) {
          if (transform$1.scale === minZoom) return;

          ratio = minZoom / transform$1.scale;
        }
        if (newScale > maxZoom) {
          if (transform$1.scale === maxZoom) return;

          ratio = maxZoom / transform$1.scale;
        }

        var size = transformToScreen(clientX, clientY);

        transform$1.x = size.x - ratio * (size.x - transform$1.x);
        transform$1.y = size.y - ratio * (size.y - transform$1.y);

        // TODO: https://github.com/anvaka/panzoom/issues/112
        if (bounds && boundsPadding === 1 && minZoom === 1) {
          transform$1.scale *= ratio;
          keepTransformInsideBounds();
        } else {
          var transformAdjusted = keepTransformInsideBounds();
          if (!transformAdjusted) transform$1.scale *= ratio;
        }

        triggerEvent('zoom');

        makeDirty();
      }

      function zoomAbs(clientX, clientY, zoomLevel) {
        var ratio = zoomLevel / transform$1.scale;
        zoomByRatio(clientX, clientY, ratio);
      }

      function centerOn(ui) {
        var parent = ui.ownerSVGElement;
        if (!parent)
          throw new Error('ui element is required to be within the scene');

        // TODO: should i use controller's screen CTM?
        var clientRect = ui.getBoundingClientRect();
        var cx = clientRect.left + clientRect.width / 2;
        var cy = clientRect.top + clientRect.height / 2;

        var container = parent.getBoundingClientRect();
        var dx = container.width / 2 - cx;
        var dy = container.height / 2 - cy;

        internalMoveBy(dx, dy, true);
      }

      function internalMoveBy(dx, dy, smooth) {
        if (!smooth) {
          return moveBy(dx, dy);
        }

        if (moveByAnimation) moveByAnimation.cancel();

        var from = { x: 0, y: 0 };
        var to = { x: dx, y: dy };
        var lastX = 0;
        var lastY = 0;

        moveByAnimation = amator(from, to, {
          step: function (v) {
            moveBy(v.x - lastX, v.y - lastY);

            lastX = v.x;
            lastY = v.y;
          }
        });
      }

      function scroll(x, y) {
        cancelZoomAnimation();
        moveTo(x, y);
      }

      function dispose() {
        releaseEvents();
      }

      function listenForEvents() {
        owner.addEventListener('mousedown', onMouseDown, { passive: false });
        owner.addEventListener('dblclick', onDoubleClick, { passive: false });
        owner.addEventListener('touchstart', onTouch, { passive: false });
        owner.addEventListener('keydown', onKeyDown, { passive: false });

        // Need to listen on the owner container, so that we are not limited
        // by the size of the scrollable domElement
        wheel.addWheelListener(owner, onMouseWheel, { passive: false });

        makeDirty();
      }

      function releaseEvents() {
        wheel.removeWheelListener(owner, onMouseWheel);
        owner.removeEventListener('mousedown', onMouseDown);
        owner.removeEventListener('keydown', onKeyDown);
        owner.removeEventListener('dblclick', onDoubleClick);
        owner.removeEventListener('touchstart', onTouch);

        if (frameAnimation) {
          window.cancelAnimationFrame(frameAnimation);
          frameAnimation = 0;
        }

        smoothScroll.cancel();

        releaseDocumentMouse();
        releaseTouches();
        textSelection.release();

        triggerPanEnd();
      }

      function frame() {
        if (isDirty) applyTransform();
      }

      function applyTransform() {
        isDirty = false;

        // TODO: Should I allow to cancel this?
        panController.applyTransform(transform$1);

        triggerEvent('transform');
        frameAnimation = 0;
      }

      function onKeyDown(e) {
        var x = 0,
          y = 0,
          z = 0;
        if (e.keyCode === 38) {
          y = 1; // up
        } else if (e.keyCode === 40) {
          y = -1; // down
        } else if (e.keyCode === 37) {
          x = 1; // left
        } else if (e.keyCode === 39) {
          x = -1; // right
        } else if (e.keyCode === 189 || e.keyCode === 109) {
          // DASH or SUBTRACT
          z = 1; // `-` -  zoom out
        } else if (e.keyCode === 187 || e.keyCode === 107) {
          // EQUAL SIGN or ADD
          z = -1; // `=` - zoom in (equal sign on US layout is under `+`)
        }

        if (filterKey(e, x, y, z)) {
          // They don't want us to handle the key: https://github.com/anvaka/panzoom/issues/45
          return;
        }

        if (x || y) {
          e.preventDefault();
          e.stopPropagation();

          var clientRect = owner.getBoundingClientRect();
          // movement speed should be the same in both X and Y direction:
          var offset = Math.min(clientRect.width, clientRect.height);
          var moveSpeedRatio = 0.05;
          var dx = offset * moveSpeedRatio * x;
          var dy = offset * moveSpeedRatio * y;

          // TODO: currently we do not animate this. It could be better to have animation
          internalMoveBy(dx, dy);
        }

        if (z) {
          var scaleMultiplier = getScaleMultiplier(z * 100);
          var offset = transformOrigin ? getTransformOriginOffset() : midPoint();
          publicZoomTo(offset.x, offset.y, scaleMultiplier);
        }
      }

      function midPoint() {
        var ownerRect = owner.getBoundingClientRect();
        return {
          x: ownerRect.width / 2,
          y: ownerRect.height / 2
        };
      }

      function onTouch(e) {
        // let the override the touch behavior
        beforeTouch(e);

        if (e.touches.length === 1) {
          return handleSingleFingerTouch(e, e.touches[0]);
        } else if (e.touches.length === 2) {
          // handleTouchMove() will care about pinch zoom.
          pinchZoomLength = getPinchZoomLength(e.touches[0], e.touches[1]);
          multiTouch = true;
          startTouchListenerIfNeeded();
        }
      }

      function beforeTouch(e) {
        // TODO: Need to unify this filtering names. E.g. use `beforeTouch`
        if (options.onTouch && !options.onTouch(e)) {
          // if they return `false` from onTouch, we don't want to stop
          // events propagation. Fixes https://github.com/anvaka/panzoom/issues/12
          return;
        }

        e.stopPropagation();
        e.preventDefault();
      }

      function beforeDoubleClick(e) {
        // TODO: Need to unify this filtering names. E.g. use `beforeDoubleClick``
        if (options.onDoubleClick && !options.onDoubleClick(e)) {
          // if they return `false` from onTouch, we don't want to stop
          // events propagation. Fixes https://github.com/anvaka/panzoom/issues/46
          return;
        }

        e.preventDefault();
        e.stopPropagation();
      }

      function handleSingleFingerTouch(e) {
        var touch = e.touches[0];
        var offset = getOffsetXY(touch);
        lastSingleFingerOffset = offset;
        var point = transformToScreen(offset.x, offset.y);
        mouseX = point.x;
        mouseY = point.y;

        smoothScroll.cancel();
        startTouchListenerIfNeeded();
      }

      function startTouchListenerIfNeeded() {
        if (touchInProgress) {
          // no need to do anything, as we already listen to events;
          return;
        }

        touchInProgress = true;
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);
        document.addEventListener('touchcancel', handleTouchEnd);
      }

      function handleTouchMove(e) {
        if (e.touches.length === 1) {
          e.stopPropagation();
          var touch = e.touches[0];

          var offset = getOffsetXY(touch);
          var point = transformToScreen(offset.x, offset.y);

          var dx = point.x - mouseX;
          var dy = point.y - mouseY;

          if (dx !== 0 && dy !== 0) {
            triggerPanStart();
          }
          mouseX = point.x;
          mouseY = point.y;
          internalMoveBy(dx, dy);
        } else if (e.touches.length === 2) {
          // it's a zoom, let's find direction
          multiTouch = true;
          var t1 = e.touches[0];
          var t2 = e.touches[1];
          var currentPinchLength = getPinchZoomLength(t1, t2);

          // since the zoom speed is always based on distance from 1, we need to apply
          // pinch speed only on that distance from 1:
          var scaleMultiplier =
            1 + (currentPinchLength / pinchZoomLength - 1) * pinchSpeed;

          var firstTouchPoint = getOffsetXY(t1);
          var secondTouchPoint = getOffsetXY(t2);
          mouseX = (firstTouchPoint.x + secondTouchPoint.x) / 2;
          mouseY = (firstTouchPoint.y + secondTouchPoint.y) / 2;
          if (transformOrigin) {
            var offset = getTransformOriginOffset();
            mouseX = offset.x;
            mouseY = offset.y;
          }

          publicZoomTo(mouseX, mouseY, scaleMultiplier);

          pinchZoomLength = currentPinchLength;
          e.stopPropagation();
          e.preventDefault();
        }
      }

      function handleTouchEnd(e) {
        if (e.touches.length > 0) {
          var offset = getOffsetXY(e.touches[0]);
          var point = transformToScreen(offset.x, offset.y);
          mouseX = point.x;
          mouseY = point.y;
        } else {
          var now = new Date();
          if (now - lastTouchEndTime < doubleTapSpeedInMS) {
            if (transformOrigin) {
              var offset = getTransformOriginOffset();
              smoothZoom(offset.x, offset.y, zoomDoubleClickSpeed);
            } else {
              // We want untransformed x/y here.
              smoothZoom(lastSingleFingerOffset.x, lastSingleFingerOffset.y, zoomDoubleClickSpeed);
            }
          }

          lastTouchEndTime = now;

          triggerPanEnd();
          releaseTouches();
        }
      }

      function getPinchZoomLength(finger1, finger2) {
        var dx = finger1.clientX - finger2.clientX;
        var dy = finger1.clientY - finger2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
      }

      function onDoubleClick(e) {
        beforeDoubleClick(e);
        var offset = getOffsetXY(e);
        if (transformOrigin) {
          // TODO: looks like this is duplicated in the file.
          // Need to refactor
          offset = getTransformOriginOffset();
        }
        smoothZoom(offset.x, offset.y, zoomDoubleClickSpeed);
      }

      function onMouseDown(e) {
        // if client does not want to handle this event - just ignore the call
        if (beforeMouseDown(e)) return;

        if (touchInProgress) {
          // modern browsers will fire mousedown for touch events too
          // we do not want this: touch is handled separately.
          e.stopPropagation();
          return false;
        }
        // for IE, left click == 1
        // for Firefox, left click == 0
        var isLeftButton =
          (e.button === 1 && window.event !== null) || e.button === 0;
        if (!isLeftButton) return;

        smoothScroll.cancel();

        var offset = getOffsetXY(e);
        var point = transformToScreen(offset.x, offset.y);
        mouseX = point.x;
        mouseY = point.y;

        // We need to listen on document itself, since mouse can go outside of the
        // window, and we will loose it
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        textSelection.capture(e.target || e.srcElement);

        return false;
      }

      function onMouseMove(e) {
        // no need to worry about mouse events when touch is happening
        if (touchInProgress) return;

        triggerPanStart();

        var offset = getOffsetXY(e);
        var point = transformToScreen(offset.x, offset.y);
        var dx = point.x - mouseX;
        var dy = point.y - mouseY;

        mouseX = point.x;
        mouseY = point.y;

        internalMoveBy(dx, dy);
      }

      function onMouseUp() {
        textSelection.release();
        triggerPanEnd();
        releaseDocumentMouse();
      }

      function releaseDocumentMouse() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        panstartFired = false;
      }

      function releaseTouches() {
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        document.removeEventListener('touchcancel', handleTouchEnd);
        panstartFired = false;
        multiTouch = false;
        touchInProgress = false;
      }

      function onMouseWheel(e) {
        // if client does not want to handle this event - just ignore the call
        if (beforeWheel(e)) return;

        smoothScroll.cancel();

        var delta = e.deltaY;
        if (e.deltaMode > 0) delta *= 100;

        var scaleMultiplier = getScaleMultiplier(delta);

        if (scaleMultiplier !== 1) {
          var offset = transformOrigin
            ? getTransformOriginOffset()
            : getOffsetXY(e);
          publicZoomTo(offset.x, offset.y, scaleMultiplier);
          e.preventDefault();
        }
      }

      function getOffsetXY(e) {
        var offsetX, offsetY;
        // I tried using e.offsetX, but that gives wrong results for svg, when user clicks on a path.
        var ownerRect = owner.getBoundingClientRect();
        offsetX = e.clientX - ownerRect.left;
        offsetY = e.clientY - ownerRect.top;

        return { x: offsetX, y: offsetY };
      }

      function smoothZoom(clientX, clientY, scaleMultiplier) {
        var fromValue = transform$1.scale;
        var from = { scale: fromValue };
        var to = { scale: scaleMultiplier * fromValue };

        smoothScroll.cancel();
        cancelZoomAnimation();

        zoomToAnimation = amator(from, to, {
          step: function (v) {
            zoomAbs(clientX, clientY, v.scale);
          },
          done: triggerZoomEnd
        });
      }

      function smoothZoomAbs(clientX, clientY, toScaleValue) {
        var fromValue = transform$1.scale;
        var from = { scale: fromValue };
        var to = { scale: toScaleValue };

        smoothScroll.cancel();
        cancelZoomAnimation();

        zoomToAnimation = amator(from, to, {
          step: function (v) {
            zoomAbs(clientX, clientY, v.scale);
          }
        });
      }

      function getTransformOriginOffset() {
        var ownerRect = owner.getBoundingClientRect();
        return {
          x: ownerRect.width * transformOrigin.x,
          y: ownerRect.height * transformOrigin.y
        };
      }

      function publicZoomTo(clientX, clientY, scaleMultiplier) {
        smoothScroll.cancel();
        cancelZoomAnimation();
        return zoomByRatio(clientX, clientY, scaleMultiplier);
      }

      function cancelZoomAnimation() {
        if (zoomToAnimation) {
          zoomToAnimation.cancel();
          zoomToAnimation = null;
        }
      }

      function getScaleMultiplier(delta) {
        var sign = Math.sign(delta);
        var deltaAdjustedSpeed = Math.min(0.25, Math.abs(speed * delta / 128));
        return 1 - sign * deltaAdjustedSpeed;
      }

      function triggerPanStart() {
        if (!panstartFired) {
          triggerEvent('panstart');
          panstartFired = true;
          smoothScroll.start();
        }
      }

      function triggerPanEnd() {
        if (panstartFired) {
          // we should never run smooth scrolling if it was multiTouch (pinch zoom animation):
          if (!multiTouch) smoothScroll.stop();
          triggerEvent('panend');
        }
      }

      function triggerZoomEnd() {
        triggerEvent('zoomend');
      }

      function triggerEvent(name) {
        api.fire(name, api);
      }
    }

    function parseTransformOrigin(options) {
      if (!options) return;
      if (typeof options === 'object') {
        if (!isNumber$1(options.x) || !isNumber$1(options.y))
          failTransformOrigin(options);
        return options;
      }

      failTransformOrigin();
    }

    function failTransformOrigin(options) {
      console.error(options);
      throw new Error(
        [
          'Cannot parse transform origin.',
          'Some good examples:',
          '  "center center" can be achieved with {x: 0.5, y: 0.5}',
          '  "top center" can be achieved with {x: 0.5, y: 0}',
          '  "bottom right" can be achieved with {x: 1, y: 1}'
        ].join('\n')
      );
    }

    function noop$4() { }

    function validateBounds(bounds) {
      var boundsType = typeof bounds;
      if (boundsType === 'undefined' || boundsType === 'boolean') return; // this is okay
      // otherwise need to be more thorough:
      var validBounds =
        isNumber$1(bounds.left) &&
        isNumber$1(bounds.top) &&
        isNumber$1(bounds.bottom) &&
        isNumber$1(bounds.right);

      if (!validBounds)
        throw new Error(
          'Bounds object is not valid. It can be: ' +
          'undefined, boolean (true|false) or an object {left, top, right, bottom}'
        );
    }

    function isNumber$1(x) {
      return Number.isFinite(x);
    }

    // IE 11 does not support isNaN:
    function isNaN$1(value) {
      if (Number.isNaN) {
        return Number.isNaN(value);
      }

      return value !== value;
    }

    function rigidScroll() {
      return {
        start: noop$4,
        stop: noop$4,
        cancel: noop$4
      };
    }

    function autoRun() {
      if (typeof document === 'undefined') return;

      var scripts = document.getElementsByTagName('script');
      if (!scripts) return;
      var panzoomScript;

      for (var i = 0; i < scripts.length; ++i) {
        var x = scripts[i];
        if (x.src && x.src.match(/\bpanzoom(\.min)?\.js/)) {
          panzoomScript = x;
          break;
        }
      }

      if (!panzoomScript) return;

      var query = panzoomScript.getAttribute('query');
      if (!query) return;

      var globalName = panzoomScript.getAttribute('name') || 'pz';
      var started = Date.now();

      tryAttach();

      function tryAttach() {
        var el = document.querySelector(query);
        if (!el) {
          var now = Date.now();
          var elapsed = now - started;
          if (elapsed < 2000) {
            // Let's wait a bit
            setTimeout(tryAttach, 100);
            return;
          }
          // If we don't attach within 2 seconds to the target element, consider it a failure
          console.error('Cannot find the panzoom element', globalName);
          return;
        }
        var options = collectOptions(panzoomScript);
        console.log(options);
        window[globalName] = createPanZoom(el, options);
      }

      function collectOptions(script) {
        var attrs = script.attributes;
        var options = {};
        for (var i = 0; i < attrs.length; ++i) {
          var attr = attrs[i];
          var nameValue = getPanzoomAttributeNameValue(attr);
          if (nameValue) {
            options[nameValue.name] = nameValue.value;
          }
        }

        return options;
      }

      function getPanzoomAttributeNameValue(attr) {
        if (!attr.name) return;
        var isPanZoomAttribute =
          attr.name[0] === 'p' && attr.name[1] === 'z' && attr.name[2] === '-';

        if (!isPanZoomAttribute) return;

        var name = attr.name.substr(3);
        var value = JSON.parse(attr.value);
        return { name: name, value: value };
      }
    }

    autoRun();

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* src/treeVis/TreeVisBranch.svelte generated by Svelte v3.21.0 */

    const { Object: Object_1$2 } = globals;
    const file$a = "src/treeVis/TreeVisBranch.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i][0];
    	child_ctx[16] = list[i][1];
    	return child_ctx;
    }

    // (116:4) {#if pendingLoad > 0}
    function create_if_block$3(ctx) {
    	let span;
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text("+");
    			t1 = text(/*pendingLoad*/ ctx[2]);
    			attr_dev(span, "class", "pendingLoad svelte-szlzja");
    			add_location(span, file$a, 116, 8, 4865);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*pendingLoad*/ 4) set_data_dev(t1, /*pendingLoad*/ ctx[2]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(116:4) {#if pendingLoad > 0}",
    		ctx
    	});

    	return block;
    }

    // (122:8) {#each children as [index, child] (index)}
    function create_each_block$2(key_1, ctx) {
    	let first;
    	let current;

    	const treevisbranch = new TreeVisBranch({
    			props: {
    				parentStore: /*branchStore*/ ctx[0],
    				branchStore: /*child*/ ctx[16]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(treevisbranch.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(treevisbranch, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const treevisbranch_changes = {};
    			if (dirty & /*branchStore*/ 1) treevisbranch_changes.parentStore = /*branchStore*/ ctx[0];
    			if (dirty & /*children*/ 8) treevisbranch_changes.branchStore = /*child*/ ctx[16];
    			treevisbranch.$set(treevisbranch_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(treevisbranch.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(treevisbranch.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(treevisbranch, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(122:8) {#each children as [index, child] (index)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div2;
    	let div0;
    	let span;
    	let t0;
    	let span_transition;
    	let div0_style_value;
    	let t1;
    	let t2;
    	let div1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let div2_transition;
    	let current;
    	let dispose;
    	let if_block = /*pendingLoad*/ ctx[2] > 0 && create_if_block$3(ctx);
    	let each_value = /*children*/ ctx[3];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*index*/ ctx[15];
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			span = element("span");
    			t0 = text(/*childIndex*/ ctx[1]);
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(span, "class", "label svelte-szlzja");
    			add_location(span, file$a, 111, 8, 4742);
    			attr_dev(div0, "class", "node svelte-szlzja");
    			attr_dev(div0, "style", div0_style_value = "background-color: " + /*nodeColor*/ ctx[4] + ";");
    			add_location(div0, file$a, 105, 4, 4547);
    			attr_dev(div1, "class", "row svelte-szlzja");
    			add_location(div1, file$a, 120, 4, 4953);
    			attr_dev(div2, "class", "column svelte-szlzja");
    			add_location(div2, file$a, 104, 0, 4506);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, span);
    			append_dev(span, t0);
    			append_dev(div2, t1);
    			if (if_block) if_block.m(div2, null);
    			append_dev(div2, t2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(div0, "mousedown", /*leftClick*/ ctx[5], false, false, false),
    				listen_dev(div0, "contextmenu", prevent_default(/*rightClick*/ ctx[6]), false, true, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*childIndex*/ 2) set_data_dev(t0, /*childIndex*/ ctx[1]);

    			if (!current || dirty & /*nodeColor*/ 16 && div0_style_value !== (div0_style_value = "background-color: " + /*nodeColor*/ ctx[4] + ";")) {
    				attr_dev(div0, "style", div0_style_value);
    			}

    			if (/*pendingLoad*/ ctx[2] > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(div2, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*branchStore, children*/ 9) {
    				const each_value = /*children*/ ctx[3];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div1, outro_and_destroy_block, create_each_block$2, null, get_each_context$2);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, fade, {}, true);
    				span_transition.run(1);
    			});

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, {}, true);
    				div2_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, fade, {}, false);
    			span_transition.run(0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, {}, false);
    			div2_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching && span_transition) span_transition.end();
    			if (if_block) if_block.d();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (detaching && div2_transition) div2_transition.end();
    			run_all(dispose);
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
    	let $branchStore,
    		$$unsubscribe_branchStore = noop,
    		$$subscribe_branchStore = () => ($$unsubscribe_branchStore(), $$unsubscribe_branchStore = subscribe(branchStore, $$value => $$invalidate(9, $branchStore = $$value)), branchStore);

    	let $configStore;
    	validate_store(configStore, "configStore");
    	component_subscribe($$self, configStore, $$value => $$invalidate(12, $configStore = $$value));
    	$$self.$$.on_destroy.push(() => $$unsubscribe_branchStore());
    	let { parentStore } = $$props;
    	let { branchStore } = $$props;
    	validate_store(branchStore, "branchStore");
    	$$subscribe_branchStore();

    	function leftClick(mouseEvent) {
    		if (mouseEvent.button === 0) {
    			if (mouseEvent.ctrlKey) {
    				if (branchState !== null) {
    					request($configStore, branchStore, branchState);
    				}
    			} else {
    				root.select(path);
    			}
    		}
    	}

    	function rightClick() {
    		parentStore.deleteChild(childIndex);
    	}

    	const writable_props = ["parentStore", "branchStore"];

    	Object_1$2.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TreeVisBranch> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TreeVisBranch", $$slots, []);

    	$$self.$set = $$props => {
    		if ("parentStore" in $$props) $$invalidate(7, parentStore = $$props.parentStore);
    		if ("branchStore" in $$props) $$subscribe_branchStore($$invalidate(0, branchStore = $$props.branchStore));
    	};

    	$$self.$capture_state = () => ({
    		root,
    		fade,
    		configStore,
    		request,
    		parentStore,
    		branchStore,
    		leftClick,
    		rightClick,
    		branchState,
    		$branchStore,
    		path,
    		childIndex,
    		pendingLoad,
    		childStores,
    		children,
    		$configStore,
    		onSelectedPath,
    		selectedByParent,
    		nodeColor
    	});

    	$$self.$inject_state = $$props => {
    		if ("parentStore" in $$props) $$invalidate(7, parentStore = $$props.parentStore);
    		if ("branchStore" in $$props) $$subscribe_branchStore($$invalidate(0, branchStore = $$props.branchStore));
    		if ("branchState" in $$props) $$invalidate(8, branchState = $$props.branchState);
    		if ("path" in $$props) $$invalidate(10, path = $$props.path);
    		if ("childIndex" in $$props) $$invalidate(1, childIndex = $$props.childIndex);
    		if ("pendingLoad" in $$props) $$invalidate(2, pendingLoad = $$props.pendingLoad);
    		if ("childStores" in $$props) $$invalidate(11, childStores = $$props.childStores);
    		if ("children" in $$props) $$invalidate(3, children = $$props.children);
    		if ("onSelectedPath" in $$props) $$invalidate(13, onSelectedPath = $$props.onSelectedPath);
    		if ("selectedByParent" in $$props) $$invalidate(14, selectedByParent = $$props.selectedByParent);
    		if ("nodeColor" in $$props) $$invalidate(4, nodeColor = $$props.nodeColor);
    	};

    	let branchState;
    	let path;
    	let childIndex;
    	let pendingLoad;
    	let childStores;
    	let children;
    	let onSelectedPath;
    	let selectedByParent;
    	let nodeColor;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$branchStore*/ 512) {
    			 $$invalidate(8, branchState = $branchStore);
    		}

    		if ($$self.$$.dirty & /*branchState*/ 256) {
    			 $$invalidate(10, path = branchState.path);
    		}

    		if ($$self.$$.dirty & /*path*/ 1024) {
    			 $$invalidate(1, childIndex = path[path.length - 1]);
    		}

    		if ($$self.$$.dirty & /*branchState*/ 256) {
    			 $$invalidate(2, pendingLoad = branchState.pendingLoad);
    		}

    		if ($$self.$$.dirty & /*branchState*/ 256) {
    			 $$invalidate(11, childStores = branchState.children);
    		}

    		if ($$self.$$.dirty & /*childStores*/ 2048) {
    			 $$invalidate(3, children = Object.entries(childStores));
    		}

    		if ($$self.$$.dirty & /*branchState*/ 256) {
    			 $$invalidate(13, onSelectedPath = branchState.onSelectedPath);
    		}

    		if ($$self.$$.dirty & /*branchState*/ 256) {
    			 $$invalidate(14, selectedByParent = branchState.selectedByParent);
    		}

    		if ($$self.$$.dirty & /*onSelectedPath, selectedByParent*/ 24576) {
    			 $$invalidate(4, nodeColor = onSelectedPath
    			? "#f00"
    			: selectedByParent ? "#f90" : "#fff");
    		}
    	};

    	return [
    		branchStore,
    		childIndex,
    		pendingLoad,
    		children,
    		nodeColor,
    		leftClick,
    		rightClick,
    		parentStore
    	];
    }

    class TreeVisBranch extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { parentStore: 7, branchStore: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TreeVisBranch",
    			options,
    			id: create_fragment$a.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*parentStore*/ ctx[7] === undefined && !("parentStore" in props)) {
    			console.warn("<TreeVisBranch> was created without expected prop 'parentStore'");
    		}

    		if (/*branchStore*/ ctx[0] === undefined && !("branchStore" in props)) {
    			console.warn("<TreeVisBranch> was created without expected prop 'branchStore'");
    		}
    	}

    	get parentStore() {
    		throw new Error("<TreeVisBranch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set parentStore(value) {
    		throw new Error("<TreeVisBranch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get branchStore() {
    		throw new Error("<TreeVisBranch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set branchStore(value) {
    		throw new Error("<TreeVisBranch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/treeVis/TreeVisRoot.svelte generated by Svelte v3.21.0 */

    const { Object: Object_1$3 } = globals;
    const file$b = "src/treeVis/TreeVisRoot.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i][0];
    	child_ctx[9] = list[i][1];
    	return child_ctx;
    }

    // (96:4) {#if pendingLoad > 0}
    function create_if_block$4(ctx) {
    	let span;
    	let t0;
    	let t1;
    	let span_transition;
    	let current;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text("+");
    			t1 = text(/*pendingLoad*/ ctx[0]);
    			attr_dev(span, "class", "pendingLoad svelte-171ue1o");
    			add_location(span, file$b, 96, 8, 4368);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*pendingLoad*/ 1) set_data_dev(t1, /*pendingLoad*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, fade, {}, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, fade, {}, false);
    			span_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching && span_transition) span_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(96:4) {#if pendingLoad > 0}",
    		ctx
    	});

    	return block;
    }

    // (102:8) {#each children as [index, child] (index)}
    function create_each_block$3(key_1, ctx) {
    	let first;
    	let current;

    	const treevisbranch = new TreeVisBranch({
    			props: {
    				parentStore: root,
    				branchStore: /*child*/ ctx[9]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(treevisbranch.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(treevisbranch, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const treevisbranch_changes = {};
    			if (dirty & /*children*/ 2) treevisbranch_changes.branchStore = /*child*/ ctx[9];
    			treevisbranch.$set(treevisbranch_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(treevisbranch.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(treevisbranch.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(treevisbranch, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(102:8) {#each children as [index, child] (index)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let div2_transition;
    	let current;
    	let dispose;
    	let if_block = /*pendingLoad*/ ctx[0] > 0 && create_if_block$4(ctx);
    	let each_value = /*children*/ ctx[1];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*index*/ ctx[8];
    	validate_each_keys(ctx, each_value, get_each_context$3, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "node svelte-171ue1o");
    			add_location(div0, file$b, 94, 4, 4241);
    			attr_dev(div1, "class", "row svelte-171ue1o");
    			add_location(div1, file$b, 100, 4, 4472);
    			attr_dev(div2, "class", "column svelte-171ue1o");
    			add_location(div2, file$b, 93, 0, 4200);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t0);
    			if (if_block) if_block.m(div2, null);
    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(div0, "mousedown", /*leftClick*/ ctx[2], false, false, false),
    				listen_dev(div0, "contextmenu", prevent_default(/*rightClick*/ ctx[3]), false, true, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*pendingLoad*/ ctx[0] > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*pendingLoad*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div2, t1);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*root, children*/ 2) {
    				const each_value = /*children*/ ctx[1];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$3, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div1, outro_and_destroy_block, create_each_block$3, null, get_each_context$3);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			add_render_callback(() => {
    				if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, {}, true);
    				div2_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			if (!div2_transition) div2_transition = create_bidirectional_transition(div2, fade, {}, false);
    			div2_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (detaching && div2_transition) div2_transition.end();
    			run_all(dispose);
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

    function instance$b($$self, $$props, $$invalidate) {
    	let $root;
    	let $configStore;
    	validate_store(root, "root");
    	component_subscribe($$self, root, $$value => $$invalidate(5, $root = $$value));
    	validate_store(configStore, "configStore");
    	component_subscribe($$self, configStore, $$value => $$invalidate(7, $configStore = $$value));

    	function leftClick(mouseEvent) {
    		if (mouseEvent.button === 0) {
    			if (mouseEvent.ctrlKey) {
    				if (branchState !== null) {
    					request($configStore, root, branchState);
    				}
    			} else {
    				root.select([]);
    			}
    		}
    	}

    	function rightClick() {
    		children.map(pair => pair[0]).forEach(idx => root.deleteChild(idx));
    	}

    	const writable_props = [];

    	Object_1$3.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TreeVisRoot> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TreeVisRoot", $$slots, []);

    	$$self.$capture_state = () => ({
    		root,
    		fade,
    		configStore,
    		request,
    		TreeVisBranch,
    		leftClick,
    		rightClick,
    		branchState,
    		$root,
    		pendingLoad,
    		childStores,
    		children,
    		$configStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("branchState" in $$props) $$invalidate(4, branchState = $$props.branchState);
    		if ("pendingLoad" in $$props) $$invalidate(0, pendingLoad = $$props.pendingLoad);
    		if ("childStores" in $$props) $$invalidate(6, childStores = $$props.childStores);
    		if ("children" in $$props) $$invalidate(1, children = $$props.children);
    	};

    	let branchState;
    	let pendingLoad;
    	let childStores;
    	let children;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$root*/ 32) {
    			 $$invalidate(4, branchState = $root);
    		}

    		if ($$self.$$.dirty & /*branchState*/ 16) {
    			 $$invalidate(0, pendingLoad = branchState.pendingLoad);
    		}

    		if ($$self.$$.dirty & /*branchState*/ 16) {
    			 $$invalidate(6, childStores = branchState.children);
    		}

    		if ($$self.$$.dirty & /*childStores*/ 64) {
    			 $$invalidate(1, children = Object.entries(childStores));
    		}
    	};

    	return [pendingLoad, children, leftClick, rightClick];
    }

    class TreeVisRoot extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TreeVisRoot",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/treeVis/TreeVis.svelte generated by Svelte v3.21.0 */
    const file$c = "src/treeVis/TreeVis.svelte";

    // (47:0) {#if root != null}
    function create_if_block$5(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let current;
    	const treevisroot = new TreeVisRoot({ $$inline: true });

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			create_component(treevisroot.$$.fragment);
    			attr_dev(div0, "class", "tree-position svelte-l0lyq8");
    			add_location(div0, file$c, 49, 6, 1830);
    			attr_dev(div1, "class", "pan-container svelte-l0lyq8");
    			add_location(div1, file$c, 48, 4, 1774);
    			attr_dev(div2, "class", "tree-container svelte-l0lyq8");
    			add_location(div2, file$c, 47, 2, 1741);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			mount_component(treevisroot, div0, null);
    			/*div1_binding*/ ctx[1](div1);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(treevisroot.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(treevisroot.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(treevisroot);
    			/*div1_binding*/ ctx[1](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(47:0) {#if root != null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = root != null && create_if_block$5(ctx);

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
    			if (root != null) if_block.p(ctx, dirty);
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
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let container;

    	afterUpdate(() => {
    		panzoom(container, {
    			minZoom: 0.1,
    			maxZoom: 2,
    			zoomDoubleClickSpeed: 1,
    			smoothScroll: false
    		});
    	}); // TODO middle click = reset zoom

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TreeVis> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TreeVis", $$slots, []);

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(0, container = $$value);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		afterUpdate,
    		autoPlayStore,
    		preplayStore,
    		configStore,
    		request,
    		root,
    		panzoom,
    		TreeVisRoot,
    		container
    	});

    	$$self.$inject_state = $$props => {
    		if ("container" in $$props) $$invalidate(0, container = $$props.container);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [container, div1_binding];
    }

    class TreeVis extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TreeVis",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/links/Links.svelte generated by Svelte v3.21.0 */

    const file$d = "src/links/Links.svelte";

    function create_fragment$d(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let span0;
    	let a0;
    	let t3;
    	let span1;
    	let a1;
    	let t5;
    	let span2;
    	let a2;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Links";
    			t1 = space();
    			span0 = element("span");
    			a0 = element("a");
    			a0.textContent = "Music generation using Musenet's API";
    			t3 = space();
    			span1 = element("span");
    			a1 = element("a");
    			a1.textContent = "Source code available on Github";
    			t5 = space();
    			span2 = element("span");
    			a2 = element("a");
    			a2.textContent = "Developed by Steven Waterman";
    			add_location(h1, file$d, 19, 2, 769);
    			attr_dev(a0, "href", "https://openai.com/blog/musenet/");
    			add_location(a0, file$d, 21, 4, 797);
    			add_location(span0, file$d, 20, 2, 786);
    			attr_dev(a1, "href", "https://github.com/stevenwaterman/musetree");
    			add_location(a1, file$d, 26, 4, 916);
    			add_location(span1, file$d, 25, 2, 905);
    			attr_dev(a2, "href", "http://www.stevenwaterman.uk");
    			add_location(a2, file$d, 31, 4, 1040);
    			add_location(span2, file$d, 30, 2, 1029);
    			attr_dev(div, "class", "container svelte-1ehvor");
    			add_location(div, file$d, 18, 0, 743);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, span0);
    			append_dev(span0, a0);
    			append_dev(div, t3);
    			append_dev(div, span1);
    			append_dev(span1, a1);
    			append_dev(div, t5);
    			append_dev(div, span2);
    			append_dev(span2, a2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
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

    function instance$d($$self, $$props) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Links> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Links", $$slots, []);
    	return [];
    }

    class Links extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Links",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.21.0 */
    const file$e = "src/App.svelte";

    function create_fragment$e(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let div2;
    	let t3;
    	let t4;
    	let current;
    	const track = new Track({ $$inline: true });
    	const trackcontrols = new TrackControls({ $$inline: true });
    	const treevis = new TreeVis({ $$inline: true });
    	const generationoptions = new GenerationOptions({ $$inline: true });
    	const persistenceoptions = new PersistenceOptions({ $$inline: true });
    	const links = new Links({ $$inline: true });

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			create_component(track.$$.fragment);
    			t0 = space();
    			create_component(trackcontrols.$$.fragment);
    			t1 = space();
    			div1 = element("div");
    			create_component(treevis.$$.fragment);
    			t2 = space();
    			div2 = element("div");
    			create_component(generationoptions.$$.fragment);
    			t3 = space();
    			create_component(persistenceoptions.$$.fragment);
    			t4 = space();
    			create_component(links.$$.fragment);
    			attr_dev(div0, "class", "col svelte-c1mbem");
    			add_location(div0, file$e, 40, 2, 1862);
    			attr_dev(div1, "class", "col svelte-c1mbem");
    			add_location(div1, file$e, 44, 2, 1927);
    			attr_dev(div2, "class", "col svelte-c1mbem");
    			add_location(div2, file$e, 47, 2, 1972);
    			attr_dev(div3, "class", "columns svelte-c1mbem");
    			add_location(div3, file$e, 39, 0, 1838);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			mount_component(track, div0, null);
    			append_dev(div0, t0);
    			mount_component(trackcontrols, div0, null);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			mount_component(treevis, div1, null);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			mount_component(generationoptions, div2, null);
    			append_dev(div2, t3);
    			mount_component(persistenceoptions, div2, null);
    			append_dev(div2, t4);
    			mount_component(links, div2, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(track.$$.fragment, local);
    			transition_in(trackcontrols.$$.fragment, local);
    			transition_in(treevis.$$.fragment, local);
    			transition_in(generationoptions.$$.fragment, local);
    			transition_in(persistenceoptions.$$.fragment, local);
    			transition_in(links.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(track.$$.fragment, local);
    			transition_out(trackcontrols.$$.fragment, local);
    			transition_out(treevis.$$.fragment, local);
    			transition_out(generationoptions.$$.fragment, local);
    			transition_out(persistenceoptions.$$.fragment, local);
    			transition_out(links.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(track);
    			destroy_component(trackcontrols);
    			destroy_component(treevis);
    			destroy_component(generationoptions);
    			destroy_component(persistenceoptions);
    			destroy_component(links);
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

    function instance$e($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$capture_state = () => ({
    		Track,
    		GenerationOptions,
    		PersistenceOptions,
    		TrackControls,
    		TreeVis,
    		Links,
    		TestBench
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    var main = new App({
      target: document.body,
      props: {}
    });

    return main;

}());
//# sourceMappingURL=bundle.js.map
