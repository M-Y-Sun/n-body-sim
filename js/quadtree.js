class Point
{
    /**
     * Constructs a Point instance
     * @param {number} x The x-coordinate.
     * @param {number} y The y-coordinate.
     */
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }

    /** @returns Clones a Point instance. */
    clone() { return new Point (this.x, this.y); }
}

class Vec extends Point
{
    /**
     * Constructs a Vec instance
     * @param {number} x The x-coordinate.
     * @param {number} y The y-coordinate.
     */
    constructor(x, y) { super (x, y); }

    /** @returns Clones a Vec instance. */
    clone() { return new Vec (this.x, this.y); }

    /** @returns The norm of the vector. */
    norm() { return Math.sqrt(this.x * this.x + this.y * this.y); }

    /** Scales the vector by a constant. */
    scale(n)
    {
        this.x *= n;
        this.y *= n;
    }

    /**
     * Normalizes the vector to be of norm n.
     * @param {number} n The norm to normalize to.
     */
    normalize(n)
    {
        const norm = this.norm();

        if (norm == 0) {
            this.scale(0);
            return;
        }

        this.scale(n / norm);
    }

    /**
     * @param {Vec} v The vector to add to.
     * @returns The sum of two vectors.
     */
    sum(v) { return new Vec (this.x + v.x, this.y + v.y); }
}

/** The maximum allowed velocity for each body. */
const maxVelocity = 10;

class QTNode
{
    /**
     * @param {Point} center The center of the quadrant.
     * @param {number} radius The width/height of each sub-quadrant.
     */
    constructor(center, radius)
    {
        this.children = [ undefined, undefined, undefined, undefined ];

        this.center = center;
        this.radius = radius;

        this.id = null;

        this.totalMass = 0;
        this.com       = new Point (0, 0);

        this.force = new Vec (0, 0);
    }

    /** @returns Clones a QTNode instance. */
    clone()
    {
        let newObj       = new QTNode (this.center, this.radius);
        newObj.children  = [...this.children ];
        newObj.id        = this.id;
        newObj.totalMass = this.totalMass;
        newObj.com       = this.com.clone();
        newObj.force     = this.force.clone();

        return newObj;
    }

    /**
     * @param {number} qd The quadrant.
     * @returns The new center given a quadrant number and the current center.
     */
    getNewCenter(qd)
    {
        let center = new Point (0, 0);

        if (qd == 0 || qd == 3)
            center.x = this.center.x + this.radius / 2;
        else
            center.x = this.center.x - this.radius / 2;

        if (qd == 1 || qd == 2)
            center.y = this.center.y + this.radius / 2;
        else
            center.y = this.center.y - this.radius / 2;

        return center;
    }

    /**
     * Adds a child to the current QTNode and sets the center and radius of the
     * node.
     * @param {number} qd The quadrant to insert the child to.
     */
    addChild(qd)
    {
        this.children[qd]
            = new QTNode (this.getNewCenter(qd), this.radius / 2);
    }

    /** @returns If the QTNode represents a leaf node. */
    isLeaf()
    {
        for (var chd of this.children)
            if (chd != undefined)
                return false;

        return true;
    }

    /** @returns The numeric ID of a body. e.g. "body0" -> 0 */
    numericID() { return parseInt (this.id.slice(4)); }

    /** @param {QTNode} other The other node */
    distTo(other)
    {
        return Math.sqrt(Math.pow(this.com.x - other.com.x, 2)
                         + Math.pow(this.com.y - other.com.y, 2));
    }

    /** @returns The acceleration of the body or group of bodies. */
    accel()
    {
        if (this.totalMass == 0) {
            return new Vec (0, 0);
        } else {
            let newVec = this.force.clone();
            newVec.scale(1 / this.totalMass);
            return newVec;
        }
    }

    /**
     * @param {number} t The time to calculate on.
     * @returns The velocity vector of the body or group of bodies after a
     *     certain time.
     * */
    velocity(t)
    {
        // v = v_0 + at
        // v_0 = 0 here so v = at

        let a = this.accel();
        a.scale(t);

        if (a.norm() > maxVelocity)
            a.normalize(maxVelocity);

        return a;
    }
}

class Quadtree
{
    /** The scaled gravitational constant */
    #G    = 6.6743015e1 / 2;
    #Gfac = 1;

    /**
     * The lower bound of an acceptable quadrant radius before declaring a
     * collision.
     */
    #RLIM = 1 / 64;

    /** The maximum path difference before declaring a collision. */
    // #VERR = 32;

    /**
     * Constructs a Quadtree.
     * @param {number} x The x-coordinate of the center of the bounding box
     * @param {number} y The y-coordinate of the center of the bounding box
     * @param {number} size The size of the bounding box.
     */
    constructor(x, y, size)
    {
        this.root  = new QTNode (new Point (x, y), size / 2);
        this.nodes = [];

        console.log(
            `Constructed Quadtree with center (${x}, ${y}) and size ${size}.`);
    }

    /**
     * @param {Point} center The center of the quadrant.
     * @param {Point} body The coordinates of the body.
     * @returns The quadrant number that the specified coordinate is in.
     *
     * Numbering uses cartesian quadrant numbers, minus 1 for indices.
     * 0 is north east
     * 1 is north west
     * 2 is south west
     * 3 is south east
     */
    #getQuadrant(center, body)
    {
        if (body.y <= center.y)
            return body.x <= center.x ? 1 : 0;
        else
            return body.x <= center.x ? 2 : 3;
    }

    /**
     * @param {number} m1 The mass of the first body.
     * @param {number} m2 The mass of the first body.
     * @param {number} r The distance between the two masses.
     * @returns The force between to masses a distance r away.
     */
    #forceFunc(m1, m2, r)
    {
        if (r == 0)
            return 0;

        return this.#G * this.#Gfac * m1 * m2 / (r * r);
    }

    /**
     * @param {QTNode} n1 The moving node.
     * @param {QTNode} n2 The node to compare to.
     * @returns If n1 will collide with n2.
     */
    #checkCollision(n1, n2)
    {
        const n1sz = Math.cbrt(n1.totalMass) * 5;
        const n2sz = Math.cbrt(n2.totalMass) * 5;
        return n1sz + n2sz > n1.distTo(n2);
    }

    /**
     * Scales the gravitational constant G by a certain value
     * @param {number} k The scale factor from 0 to 20
     */
    setGFac(k) { this.#Gfac = k; }

    /**
     * Adds a node to the this.nodes array
     * @param {QTNode} node The node to add
     */
    updNode(node)
    {
        const id          = node.numericID();
        this.nodes.length = Math.max(this.nodes.length, id + 1);
        this.nodes[id]    = node;
    }

    /**
     * Recursively adds a body to the quadtree
     * @param {number} x1 The x-coordinate of the body.
     * @param {number} y1 The y-coordinate of the body.
     * @param {number} mass The mass of the body.
     * @param {Vec} force The force to initialize to.
     * @param {string} id The HTML ID of the body.
     * @param {QTNode} node The node to recurse on.
     * @returns If the body was successfully added.
     */
    addBody(x1, y1, mass, force, id, node = this.root)
    {
        const qdOld = this.#getQuadrant(node.center, node.com);
        const qdNew = this.#getQuadrant(node.center, new Point (x1, y1));

        if (node != this.root && node.isLeaf() && node.id != null) {
            // if the radius is too small, implying that the bodies are super
            // close together, merge them
            if (node.radius <= this.#RLIM) {
                console.log("quadtree division");

                node.totalMass += mass;
                node.force = node.force.sum(force);

                const elemNode = document.getElementById(node.id);

                elemNode.style.width = (Math.cbrt(node.totalMass) * 10) + "px";
                elemNode.style.height
                    = (Math.cbrt(node.totalMass) * 10) + "px";

                const elemTarg = document.getElementById(id);

                // when first adding the body, it can cause the radius to be
                // too small, so in that case there's nothing to remove
                if (elemTarg != null)
                    elemTarg.remove();

                return false;
            } else {
                // if the current node is a leaf node representing a single
                // body, slice the quadrant and move the node
                node.children[qdOld]           = node.clone();
                node.children[qdOld].center    = node.getNewCenter(qdOld);
                node.children[qdOld].radius    = node.radius / 2;
                node.children[qdOld].totalMass = node.totalMass;
                node.children[qdOld].children =
                    [ undefined, undefined, undefined, undefined ];

                this.updNode(node.children[qdOld]);

                node.id    = null;
                node.force = undefined;
            }
        }

        // center of mass is a weighted average
        node.com.x = (node.com.x * node.totalMass + x1 * mass)
                     / (node.totalMass + mass);
        node.com.y = (node.com.y * node.totalMass + y1 * mass)
                     / (node.totalMass + mass);
        node.totalMass += mass;

        // if the current node is an empty leaf, place the body there
        if (node != this.root && node.isLeaf() && node.id == null) {
            node.id    = id;
            node.force = force;
            this.updNode(node);
            return true;
        }

        // create a new node if it doesn't exist before recursing there
        if (node.children[qdNew] == undefined)
            node.addChild(qdNew);

        return this.addBody(x1, y1, mass, force, id, node.children[qdNew]);
    }

    /**
     * Recursively calculates the net force vector acted on a specified body.
     * @param {QTNode} targ The node to calculate on.
     * @param {QTNode} node The node to recurse on.
     * @param {number} theta The permitted error.
     */
    calcForceV(targ, node, theta)
    {
        if (node.id == targ.id)
            return;

        const s = 2 * node.radius;
        const d = targ.distTo(node);

        if (node.isLeaf() || s / d < theta) {
            // console.log(d);
            // console.log("------")
            // console.log(targ.id);
            // console.log(targ.com)
            // console.log(targ.force);
            // console.log("------")
            // console.log(node.id);
            // console.log(node.com);
            // console.log(node.force);
            // console.log("------")
            // console.log("============")

            let v = new Vec (node.com.x - targ.com.x, node.com.y - targ.com.y);
            const fmagn = this.#forceFunc(targ.totalMass, node.totalMass, d);
            v.normalize(fmagn);
            targ.force = targ.force.sum(v);

            return;
        }

        for (var chd of node.children)
            if (chd != undefined)
                this.calcForceV(targ, chd, theta);
    }

    /**
     * Recursively checks for collisions of a node with all leaf nodes under a
     * node
     * @param {QTNode} targ The target node to collide.
     * @param {QTNode} node The current node to recurse.
     * @param {boolean} done If the node has collided.
     * @returns If a collision happened.
     */
    collide_(targ, node, done)
    {
        if (done)
            return true;

        var i = 0;
        for (var chd of node.children) {
            if (chd == undefined || chd.id == targ.id) {
                ++i;
                continue;
            }

            if (chd.isLeaf()) {
                const targElem  = document.getElementById(targ.id);
                const otherElem = document.getElementById(chd.id);

                if (this.#checkCollision(targ, chd)) {
                    if (otherElem != null)
                        otherElem.remove();

                    targ.totalMass += chd.totalMass;
                    targ.force           = targ.force.sum(chd.force);
                    targElem.style.width = targElem.style.height
                        = (Math.cbrt(targ.totalMass) * 10) + "px";

                    console.log(chd.id + " merged into " + targ.id);

                    this.nodes[chd.numericID()] = undefined;
                    node.children[i]            = undefined;
                }

                done = true;
                return true;
            } else {
                return this.collide_(targ, chd, done);
            }
        }

        return false;
    }

    /**
     * Recursively checks for collisions and merges colliding bodies.
     * @param {QTNode} node The node to recurse on.
     * @returns If the quadtree was modified.
     */
    collide(node)
    {
        let ret = false;

        for (var chd of node.children) {
            if (chd == undefined)
                continue;

            if (chd.isLeaf())
                ret = ret ? this.collide_(chd, node, false) : true;
            else
                this.collide(chd);
        }

        return ret;
    }

    /**
     * Updates the position of each leaf node and rebuilds the quadtree.
     * @param {number} theta The Barnes-Hut threshold value representing the
     *     acceptability of approximating a group of bodies with their center
     *     of mass.
     * @param {boolean} check
     */
    rebuild(theta, check)
    {
        for (var node of this.nodes) {
            if (node != undefined) {
                this.calcForceV(node, this.root, theta);
            }
        }

        // recalculate if there were collisions
        if (check && this.collide(this.root)) {
            this.rebuild(theta, false);
            return;
        }

        this.root = new QTNode (this.root.center, this.root.radius);
        let nodes = [];

        // don't do the following since it only creates a shallow copy
        // let nodes = [..this.nodes];

        for (var node of this.nodes)
            nodes.push(node);

        this.nodes = [];

        for (var node of nodes) {
            if (node != undefined) {
                node.com.x += node.velocity(1).x;
                node.com.y += node.velocity(1).y;
                this.addBody(node.com.x, node.com.y, node.totalMass,
                             node.force, node.id, this.root);
            }
        }
    }
}
